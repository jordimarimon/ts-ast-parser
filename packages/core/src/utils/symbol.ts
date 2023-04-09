import { isNamedNode } from './named-node.js';
import ts from 'typescript';


export function getAliasedSymbolIfNecessary(
    symbol: ts.Symbol | undefined,
    checker: ts.TypeChecker,
): ts.Symbol | undefined {
    if (!symbol) {
        return symbol;
    }

    // We have to check first, because the TS TypeChecker will throw an
    // error if there is no alias
    if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
        return getAliasedSymbolIfNecessary(checker.getAliasedSymbol(symbol), checker);
    }

    return symbol;
}

export function getSymbolAtLocation(node: ts.Node, checker: ts.TypeChecker): ts.Symbol | undefined {
    let symbol = checker?.getSymbolAtLocation(node);

    if (!symbol && isNamedNode(node)) {
        symbol = checker?.getSymbolAtLocation(node.name);
    }

    return symbol;
}
