import { Reference, SourceReference } from '../models/reference.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from './try-add-property.js';
import { InterfaceOrClassDeclaration } from './is.js';
import { getLocation } from './get-location.js';
import { AnalyzerContext } from '../context.js';
import ts from 'typescript';


export function isCustomElement(node: InterfaceOrClassDeclaration, context: AnalyzerContext): boolean {
    const type = context.checker.getTypeAtLocation(node);
    const baseTypes = context.checker.getBaseTypes(type as ts.InterfaceType);

    for (const baseType of baseTypes) {
        if (hasHTMLElementAsBase(baseType, context.checker)) {
            return true;
        }
    }

    return false;
}

export function hasHTMLElementAsBase(type: ts.Type, checker: ts.TypeChecker): boolean {
    const name = type.getSymbol()?.getName();

    if (name === 'HTMLElement') {
        return true;
    }

    return checker.getBaseTypes(type as ts.InterfaceType).some(t => hasHTMLElementAsBase(t, checker));
}

export function getExtendClauseReferences(node: InterfaceOrClassDeclaration, context: AnalyzerContext): Reference[] {
    const heritageClauses = node.heritageClauses ?? [];
    const references: Reference[] = [];

    for (const heritageClause of heritageClauses) {
        const types = heritageClause.types ?? [];

        for (const type of types) {
            const ref = createReference(type, context);

            if (!ref) {
                continue;
            }

            references.push(ref);
        }
    }

    return references;
}

export function createReference(type: ts.ExpressionWithTypeArguments, context: AnalyzerContext): Reference | null {
    const expr = type.expression;
    const typeArguments = type.typeArguments;

    if (!ts.isIdentifier(expr)) {
        return null;
    }

    const {path, symbol, line} = getLocation(expr, context);

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

    return ts.SymbolFlags.Class & symbol.flags ? DeclarationKind.Class : DeclarationKind.Interface;
}
