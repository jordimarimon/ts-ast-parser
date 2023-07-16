import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from './symbol.js';
import type { AnalyserContext } from '../context.js';
import type { SymbolWithLocation } from './is.js';
import type ts from 'typescript';


/**
 * Given a node or a type it returns it's associated symbol, line position and the file path where
 * it was defined.
 *
 * @param nodeOrType - The node or type to search for
 * @param context - The analyzer context where the node/type belongs to
 *
 * @returns The symbol, line position and path where the node/type is located
 */
export function getLocation(nodeOrType: ts.Node | ts.Type, context: AnalyserContext): SymbolWithLocation {
    let symbol: ts.Symbol | undefined;

    if ('kind' in nodeOrType) {
        symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(nodeOrType, context.checker), context.checker);
    } else {
        symbol = nodeOrType.aliasSymbol ?? nodeOrType.getSymbol();
    }

    const decl = symbol?.getDeclarations()?.[0];
    const sourceFile = decl?.getSourceFile();
    const path = context.normalizePath(sourceFile?.fileName) ?? '';

    return {
        symbol,
        line: decl ? getLinePosition(decl) : null,
        path,
    };
}

/**
 * Returns the start line number where the node is located
 *
 * @param node - The node to locate
 *
 * @returns The line number where the node is located
 */
export function getLinePosition(node: ts.Node): number {
    return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
}
