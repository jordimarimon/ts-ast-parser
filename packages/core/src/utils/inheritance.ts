import { DeclarationKind, Reference, SourceReference } from '../models/index.js';
import { NodeWithHeritageClause, SymbolWithType } from './types.js';
import { tryAddProperty } from './try-add-property.js';
import { isThirdPartyImport } from './import.js';
import { getLocation } from './get-location.js';
import { Context } from '../context.js';
import ts from 'typescript';


export interface InheritedSymbol {
    baseType: ts.BaseType;
    symbol: ts.Symbol | undefined;
    properties: SymbolWithType[];
}

export interface ExtendClauseRef {
    symbol: ts.Symbol | undefined;
    reference: Reference;
}

export function getInheritedSymbol(node: ts.Node): InheritedSymbol | null {
    const checker = Context.checker;
    const type = checker?.getTypeAtLocation(node);
    const baseType = type?.getBaseTypes()?.[0];

    if (!baseType) {
        return null;
    }

    const symbol = baseType.getSymbol();
    const superNode = symbol?.getDeclarations()?.[0];

    // We don't output metadata for the properties of 3rd party declarations.
    // For example the HTMLElement class has 287 properties... we just can't document
    // 3rd party inheritances.
    // Don't ignore utility types like `Required`, `Pick`, etc...
    if (
        isThirdPartyImport(superNode?.getSourceFile().fileName ?? '') &&
        (superNode && !ts.isMappedTypeNode(superNode))
    ) {
        return {
            symbol,
            baseType,
            properties: [],
        };
    }

    const properties: SymbolWithType[] = [];

    for (const prop of baseType.getProperties()) {
        const decl = prop.getDeclarations()?.[0];
        const filePath = decl?.getSourceFile()?.fileName ?? '';

        // Remove properties that come from third party parent classes
        if (isThirdPartyImport(filePath)) {
            continue;
        }

        properties.push({
            symbol: prop,
            type: checker?.getTypeOfSymbolAtLocation(prop, node),
        });
    }

    return {
        symbol,
        baseType,
        properties,
    };
}

export function getExtendClauseReferences(node: NodeWithHeritageClause): ExtendClauseRef[] {
    const heritageClauses = node.heritageClauses ?? [];
    const references: ExtendClauseRef[] = [];
    const checker = Context.checker;

    for (const heritageClause of heritageClauses) {
        const types = heritageClause.types ?? [];

        for (const type of types) {
            const expr = type.expression;
            const typeArguments = type.typeArguments;

            if (!ts.isIdentifier(expr)) {
                continue;
            }

            const {path, decl} = getLocation(expr);
            const symbol = checker?.getSymbolAtLocation(expr);

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

            references.push({reference: ref, symbol});
        }
    }

    return references;
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

export function isInheritedMember(name: string, inheritedSymbol: InheritedSymbol | null | undefined): boolean {
    if (!inheritedSymbol) {
        return false;
    }

    for (const prop of inheritedSymbol.properties) {
        if (prop.symbol.getName() === name) {
            return true;
        }
    }

    return false;
}
