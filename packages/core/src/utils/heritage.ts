import type { Reference, SourceReference } from '../models/reference.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import type { InterfaceOrClassDeclaration } from './is.js';
import { tryAddProperty } from './try-add-property.js';
import type { AnalyserContext } from '../context.js';
import { getLocation } from './get-location.js';
import { isThirdParty } from './import.js';
import { hasFlag } from './member.js';
import ts from 'typescript';


/**
 * Checks it the node is a custom element. As of right now we treat a node to be a custom element
 * if HTMLElement is in the heritage chain.
 *
 * @param node - The node to check
 * @param context - The analyzer context where the node belongs to
 *
 * @returns True if the node extends HTMLElement
 */
export function isCustomElement(node: InterfaceOrClassDeclaration, context: AnalyserContext): boolean {
    const type = context.checker.getTypeAtLocation(node);
    const baseTypes = context.checker.getBaseTypes(type as ts.InterfaceType);

    for (const baseType of baseTypes) {
        if (hasHTMLElementAsBase(baseType, context.checker)) {
            return true;
        }
    }

    return false;
}

/**
 * Checks in the heritage chain if there is an HTMLElement type.
 * It assumes that if there is an HTMLElement type, it's from "lib.dom.d.ts"
 *
 * @param type - The base type to check
 * @param checker - The TypeScript type checker from the analyzer context
 *
 * @returns True if HTMLElement has been found as a base type
 */
export function hasHTMLElementAsBase(type: ts.Type, checker: ts.TypeChecker): boolean {
    const name = type.getSymbol()?.getName();

    if (name === 'HTMLElement') {
        return true;
    }

    return checker.getBaseTypes(type as ts.InterfaceType).some(t => hasHTMLElementAsBase(t, checker));
}

/**
 * Returns the heritage chain defined via the `extends` clause
 *
 * @param node - An interface or class declaration node
 * @param context - The analyzer context where the node belongs to
 *
 * @returns The heritage chain
 */
export function getExtendClauseReferences(node: InterfaceOrClassDeclaration, context: AnalyserContext): Reference[] {
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

/**
 * Creates a reference object that defines where a base type is located
 *
 * @param type - The base type
 * @param context - The analyzer context where the type belongs to
 *
 * @returns The reference object
 */
export function createReference(type: ts.ExpressionWithTypeArguments, context: AnalyserContext): Reference | null {
    const expr = type.expression;
    const typeArguments = type.typeArguments;

    if (!ts.isIdentifier(expr)) {
        return null;
    }

    const {path, symbol, line} = getLocation(expr, context);

    let name = expr.escapedText ?? '';

    if (typeArguments) {
        name += `<${getTypeArgumentNames(typeArguments).join(', ')}>`;
    }

    const sourceRef: SourceReference = {};
    const ref: Reference = {name};
    const isFromThirdParty = path && isThirdParty(path);

    if (path && !isFromThirdParty && line != null) {
        sourceRef.line = line;
        sourceRef.path = path;
    }

    tryAddProperty(ref, 'source', sourceRef);
    tryAddProperty(ref, 'kind', getInterfaceOrClassSymbolKind(symbol));

    return ref;
}

/**
 * Returns the type arguments used in a base type
 *
 * @param typeArguments - An array of TypeScript type nodes
 *
 * @returns The type arguments names concatenated
 */
export function getTypeArgumentNames(typeArguments: ts.NodeArray<ts.TypeNode> | ts.TypeNode[]): string[] {
    const names: string[] = [];

    for (const typeArgument of typeArguments) {
        let name = '';

        if (ts.isTypeReferenceNode(typeArgument)) {
            name = typeArgument.typeName.getText() ?? '';

            if (typeArgument.typeArguments) {
                name += `<${getTypeArgumentNames(typeArgument.typeArguments).join(', ')}>`;
            }
        } else {
            name += typeArgument.getText();
        }

        names.push(name);
    }

    return names;
}

/**
 * Given a symbol, checks whether is an Interface or a Class
 *
 * @param symbol - The TypeScript symbol to check
 *
 * @returns `DeclarationKind.Class` if it's a class, `DeclarationKind.Interface` if it's an interface, otherwise `null`
 */
export function getInterfaceOrClassSymbolKind(symbol: ts.Symbol | undefined): DeclarationKind | null {
    if (!symbol) {
        return null;
    }

    // Treat anything that is not a class, as an interface (for example utility types)
    return hasFlag(symbol.flags, ts.SymbolFlags.Class) ? DeclarationKind.Class : DeclarationKind.Interface;
}
