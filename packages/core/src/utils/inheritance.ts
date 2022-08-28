import { NodeWithHeritageClause } from './types.js';
import { Reference } from '../models/index.js';
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
            //  that changes the meaning of the declaration, we are still using the original
            //  declaration instead of the modified one (which I'm not sure if we can get from
            //  the TS Compiler API).

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

            let name = expr.escapedText ?? '';

            if (typeArguments) {
                const argNames = getTypeArgumentNames(typeArguments);

                name += `<${argNames.join(', ')}>`;
            }

            references.push({name});
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
