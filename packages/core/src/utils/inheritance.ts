import { InterfaceOrClassDeclaration, NodeWithHeritageClause, SymbolWithContextType } from './types.js';
import { Reference, SourceReference } from '../models/reference.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from './try-add-property.js';
import { getSymbolAtLocation } from './symbol.js';
import { getLocation } from './get-location.js';
import { isThirdParty } from './import.js';
import { Context } from '../context.js';
import { isOverride } from './class.js';
import ts from 'typescript';


export function getInstanceProperties(node: InterfaceOrClassDeclaration): SymbolWithContextType[] {
    const checker = Context.checker;
    const type = checker?.getTypeAtLocation(node);
    const props = type?.getProperties() ?? [];

    return createSymbolWithContextType(node, props);
}

export function getStaticProperties(node: ts.ClassDeclaration | ts.ClassExpression): SymbolWithContextType[] {
    const checker = Context.checker;
    const symbol = checker?.getTypeAtLocation(node).getSymbol();
    const type = symbol && checker?.getTypeOfSymbolAtLocation(symbol, node);
    const staticProps = (type && checker?.getPropertiesOfType(type)) ?? [];

    return createSymbolWithContextType(node, staticProps);
}

export function getConstructors(node: ts.ClassDeclaration | ts.ClassExpression): readonly ts.Signature[] {
    const checker = Context.checker;
    const symbol = checker?.getTypeAtLocation(node).getSymbol();
    const type = symbol && checker?.getTypeOfSymbolAtLocation(symbol, node);

    return type?.getConstructSignatures() ?? [];
}

export function getIndexSignature(node: ts.InterfaceDeclaration): SymbolWithContextType | null {
    const checker = Context.checker;
    const indexSymbol = getSymbolAtLocation(node)?.members?.get('__index' as ts.__String);
    const decl = indexSymbol?.getDeclarations()?.[0];

    if (!decl || !ts.isIndexSignatureDeclaration(decl)) {
        return null;
    }

    return {
        symbol: indexSymbol,
        type: checker?.getTypeOfSymbolAtLocation(indexSymbol, node),
    };
}

export function getExtendClauseReferences(node: NodeWithHeritageClause): Reference[] {
    const heritageClauses = node.heritageClauses ?? [];
    const references: Reference[] = [];

    for (const heritageClause of heritageClauses) {
        const types = heritageClause.types ?? [];

        for (const type of types) {
            const ref = createReference(type);

            if (!ref) {
                continue;
            }

            references.push(ref);
        }
    }

    return references;
}

export function createReference(type: ts.ExpressionWithTypeArguments): Reference | null {
    const expr = type.expression;
    const typeArguments = type.typeArguments;

    if (!ts.isIdentifier(expr)) {
        return null;
    }

    const {path, symbol, line} = getLocation(expr);

    let name = expr.escapedText ?? '';

    if (typeArguments) {
        const argNames = getTypeArgumentNames(typeArguments);

        name += `<${argNames.join(', ')}>`;
    }

    const sourceRef: SourceReference = {};
    const ref: Reference = {name};

    if (path && line != null) {
        sourceRef.line = line;
    }

    tryAddProperty(sourceRef, 'path', path);
    tryAddProperty(ref, 'source', sourceRef);
    tryAddProperty(ref, 'kind', getInterfaceOrClassSymbolKind(symbol));

    return ref;
}

export function isInherited(classOrInterfaceNode: ts.Node, memberSymbolToCheck: ts.Symbol): boolean {
    const checker = Context.checker;
    const type = checker?.getTypeAtLocation(classOrInterfaceNode);
    const baseType = type?.getBaseTypes()?.[0];

    if (!baseType) {
        return false;
    }

    return baseType.getProperties().some((parentMemberSymbol) => {
        return parentMemberSymbol.getName() === memberSymbolToCheck.getName();
    });
}

function createSymbolWithContextType(node: InterfaceOrClassDeclaration, symbols: ts.Symbol[]): SymbolWithContextType[] {
    const checker = Context.checker;
    const result: SymbolWithContextType[] = [];
    const members = node.members.map(m => getSymbolAtLocation(m)?.getName() ?? '');

    for (const propSymbol of symbols) {
        const decl = propSymbol.getDeclarations()?.[0];
        const filePath = decl?.getSourceFile()?.fileName ?? '';
        const propType = checker?.getTypeOfSymbolAtLocation(propSymbol, node);

        if (!decl) {
            continue;
        }

        // Don't convert namespace members, or the prototype here
        if (propSymbol.flags & (ts.SymbolFlags.ModuleMember | ts.SymbolFlags.Prototype)) {
            continue;
        }

        // Ignore properties that come from third party libraries
        if (isThirdParty(filePath)) {
            continue;
        }

        const inherited = isInherited(node, propSymbol);
        const isDeclFromThisNode = members.some(memberName => memberName === propSymbol.getName());

        result.push({
            symbol: propSymbol,
            inherited,
            type: propType,
            overrides: isOverride(decl) || (inherited && isDeclFromThisNode),
        });
    }

    return result;
}

function getTypeArgumentNames(typeArguments: ts.NodeArray<ts.TypeNode> | ts.TypeNode[]): string[] {
    const names: string[] = [];

    for (const typeArgument of typeArguments) {
        let name = '';

        if (ts.isTypeReferenceNode(typeArgument)) {
            name = typeArgument.typeName.getText() ?? '';

            if (typeArgument.typeArguments) {
                const argNames = getTypeArgumentNames(typeArgument.typeArguments);

                name += `<${argNames.join(', ')}>`;
            }
        } else {
            name += typeArgument.getText();
        }

        names.push(name);
    }

    return names;
}

function getInterfaceOrClassSymbolKind(symbol: ts.Symbol | undefined): DeclarationKind | null {
    if (!symbol) {
        return null;
    }

    return ts.SymbolFlags.Class & symbol.flags ? DeclarationKind.class : DeclarationKind.interface;
}
