import { DeclarationKind, Reference, SourceReference } from '../models/index.js';
import { tryAddProperty } from './try-add-property.js';
import { NodeWithHeritageClause } from './types.js';
import { isThirdPartyImport } from './import.js';
import { getLocation } from './get-location.js';
import { Context } from '../context.js';
import ts from 'typescript';


// FIXME(Jordi M.): When the parent type uses a utility type like `Required`
//  that changes the meaning of the declaration (from possible optional to not optional),
//  we are still unable to get the modified declaration and we only get the original one.
//  The symbol has the transient flag set (prop.getFlags()), which means it has been
//  created it by the checker instead of the binder.

export interface InheritedSymbol {
    symbol: ts.Symbol | undefined;
    properties: ts.Symbol[];
}

export function getParentSymbol(node: ts.Node): InheritedSymbol | null {
    const checker = Context.checker;
    const type = checker?.getTypeAtLocation(node);
    const baseType = type?.getBaseTypes()?.[0]; // We want the direct parent

    if (!baseType) {
        return null;
    }

    const superNode = baseType.getSymbol()?.getDeclarations()?.[0];

    // We don't output metadata for the properties of 3rd party declarations.
    // For example the HTMLElement class has 287 properties... we just can't document
    // 3rd party inheritances
    if (isThirdPartyImport(superNode?.getSourceFile().fileName ?? '')) {
        return {
            symbol: baseType.getSymbol(),
            properties: [],
        };
    }

    return {
        symbol: baseType.getSymbol(),

        // Remove properties that come from third party parent classes
        properties: baseType.getProperties().filter(p => {
            const decl = p.getDeclarations()?.[0];
            const filePath = decl?.getSourceFile()?.fileName ?? '';

            return !isThirdPartyImport(filePath);
        }),
    };
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

            const {path, decl} = getLocation(expr);

            let name = expr.escapedText ?? '';

            if (typeArguments) {
                const argNames = getTypeArgumentNames(typeArguments);

                name += `<${argNames.join(', ')}>`;
            }

            const sourceRef: SourceReference = {};
            const ref: Reference = {name};
            tryAddProperty(sourceRef, 'path', path);
            tryAddProperty(ref, 'href', sourceRef);
            tryAddProperty(ref, 'kind', getDeclarationKind(decl));

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

function getDeclarationKind(decl: ts.Node | undefined): DeclarationKind | null {
    if (!decl) {
        return null;
    }

    if (ts.isClassDeclaration(decl) || ts.isClassExpression(decl)) {
        return DeclarationKind.class;
    }

    if (ts.isInterfaceDeclaration(decl)) {
        return DeclarationKind.interface;
    }

    if (ts.isTypeAliasDeclaration(decl) || ts.isTypeNode(decl)) {
        return DeclarationKind.typeAlias;
    }

    return null;
}

export function isInheritedMember(name: string, inheritedSymbol: InheritedSymbol | null): boolean {
    if (!inheritedSymbol) {
        return false;
    }

    for (const prop of inheritedSymbol.properties) {
        if (prop.getName() === name) {
            return true;
        }
    }

    return false;
}
