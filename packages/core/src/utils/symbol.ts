import { isNamedNode } from './named-node.js';
import ts from 'typescript';

export function getAliasedSymbolIfNecessary(
    symbol: ts.Symbol | undefined | null,
    checker: ts.TypeChecker,
): ts.Symbol | null {
    let currSymbol = symbol;

    // We have to check first, because the TS TypeChecker will throw an
    // error if there is no alias
    while (currSymbol && (currSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
        currSymbol = checker.getAliasedSymbol(currSymbol);
    }

    return currSymbol ?? null;
}

export function getSymbolAtLocation(node: ts.Node, checker: ts.TypeChecker): ts.Symbol | null {
    let symbol = checker.getSymbolAtLocation(node);

    if (!symbol && isNamedNode(node)) {
        symbol = checker.getSymbolAtLocation(node.name);
    }

    return symbol ?? null;
}
