import { DeclarationKind, Reference, SourceReference } from '../models/index.js';
import { tryAddProperty } from './try-add-property.js';
import { NodeWithHeritageClause } from './types.js';
import { getLocation } from './get-location.js';
import { Context } from '../context.js';
import ts from 'typescript';


// FIXME(Jordi M.): When the parent type uses a utility type like `Required`
//  that changes the meaning of the declaration (from possible optional to not optional),
//  we are still unable to get the modified declaration and we only get the original one.
//  The symbol has the transient flag set (prop.getFlags()), which means it has been
//  created it by the checker instead of the binder.

export interface InheritedSymbol {
    baseSymbol: ts.Symbol | undefined;
    properties: ts.Symbol[];
}

export type InheritedSymbols = InheritedSymbol[];

export function getInheritedDeclarations(node: ts.Node): InheritedSymbols {
    const checker = Context.checker;
    const type = checker?.getTypeAtLocation(node);
    const baseTypes = type?.getBaseTypes() ?? [];

    let result: InheritedSymbols = [];

    for (const baseType of baseTypes) {
        const superNode = baseType.getSymbol()?.getDeclarations()?.[0];
        const superInheritedDeclarations = superNode ? getInheritedDeclarations(superNode) : [];

        result = [
            ...result,
            ...superInheritedDeclarations,
            {
                baseSymbol: baseType.getSymbol(),
                properties: baseType.getProperties(),
            },
        ];
    }

    return result;
}

export function getInheritanceChainRefs(node: NodeWithHeritageClause): Reference[] {
    const heritageClauses = node.heritageClauses ?? [];
    const references: Reference[] = [];

    for (const heritageClause of heritageClauses) {
        const types = heritageClause.types ?? [];

        for (const type of types) {
            const expr = type.expression;
            const typeArguments = type.typeArguments;

            if (!ts.isIdentifier(expr)) {
                continue;
            }

            const {kind, path} = getHeritageMetadata(expr);

            let name = expr.escapedText ?? '';

            if (typeArguments) {
                const argNames = getTypeArgumentNames(typeArguments);

                name += `<${argNames.join(', ')}>`;
            }

            const sourceRef: SourceReference = {};
            const ref: Reference = {name};
            tryAddProperty(sourceRef, 'path', path);
            tryAddProperty(ref, 'href', sourceRef);
            tryAddProperty(ref, 'kind', kind);

            references.push(ref);
        }
    }

    return references;
}

function getTypeArgumentNames(typeArguments: ts.NodeArray<ts.TypeNode>): string[] {
    const names: string[] = [];

    for (const typeArgument of typeArguments) {
        let name = '';

        if (ts.isTypeReferenceNode(typeArgument)) {
            name = typeArgument.typeName.getText() ?? '';

            if (typeArgument.typeArguments) {
                const argNames = getTypeArgumentNames(typeArgument.typeArguments);

                name += `<${argNames.join(', ')}>`;
            }
        }

        if (ts.isUnionTypeNode(typeArgument)) {
            name += typeArgument.types.map(t => t.getText()).join(' | ');
        }

        if (ts.isIntersectionTypeNode(typeArgument)) {
            name += typeArgument.types.map(t => t.getText()).join(' & ');
        }

        names.push(name);
    }

    return names;
}

function getHeritageMetadata(identifier: ts.Node): {kind: DeclarationKind | undefined; path: string} {
    const {path, decl} = getLocation(identifier);

    if (!decl) {
        return {kind: undefined, path: ''};
    }

    if (ts.isInterfaceDeclaration(decl)) {
        return {
            kind: DeclarationKind.interface,
            path,
        };
    }

    if (ts.isClassDeclaration(decl)) {
        return {
            kind: DeclarationKind.class,
            path,
        };
    }

    return {kind: undefined, path};
}

export function isInheritedMember(name: string, inheritedMembers: InheritedSymbols): boolean {
    for (const inheritedDecl of inheritedMembers) {
        for (const prop of inheritedDecl.properties) {
            if (prop.getName() === name) {
                return true;
            }
        }
    }

    return false;
}

export function getInheritedMemberReference(name: string, inheritedMembers: InheritedSymbols): Reference | null {
    for (const inheritedDecl of inheritedMembers) {
        const props = inheritedDecl.properties;

        if (!props?.some(prop => prop.getName() === name)) {
            continue;
        }

        const decl = inheritedDecl.baseSymbol?.getDeclarations()?.[0];
        const isClass = decl && (ts.isClassDeclaration(decl) || ts.isClassExpression(decl));

        return {
            name: inheritedDecl.baseSymbol?.getName() ?? '',
            kind: isClass ? DeclarationKind.class : DeclarationKind.interface,
            href: {
                path: Context.normalizePath(decl?.getSourceFile()?.fileName),
            },
        };
    }

    return null;
}
