import { DeclarationKind, Reference, SourceReference } from '../models/index.js';
import { tryAddProperty } from './try-add-property.js';
import { NodeWithHeritageClause } from './types.js';
import { getLocation } from './get-location.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function getInheritedDeclarations(node: NodeWithHeritageClause): ts.Declaration[] {
    const checker = Context.checker;
    const type = checker?.getTypeAtLocation(node);
    const baseTypes = type?.getBaseTypes() ?? [];
    const decls: ts.Declaration[] = [];

    for (const baseType of baseTypes) {
        const props = baseType.getProperties();

        for (const prop of props) {
            const decl = prop.getDeclarations()?.[0];

            // FIXME(Jordi M.): When the parent type uses a utility type like `Required`
            //  that changes the meaning of the declaration (from possible optional to not optional),
            //  we are still using the original declaration instead of the modified
            //  one (which I'm not sure if we can get from the TS Compiler API).
            //  The symbol has the transient flag set (prop.getFlags()), which means it has been
            //  created it by the checker instead of the binder.

            if (decl) {
                decls.push(decl);
            }
        }
    }

    return decls;
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
