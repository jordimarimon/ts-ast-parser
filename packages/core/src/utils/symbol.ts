import { Context } from '../context.js';
import { isNamedNode } from './node.js';
import ts from 'typescript';


export function getAliasedSymbolIfNecessary(symbol: ts.Symbol | undefined): ts.Symbol | undefined {
    const checker = Context.checker;

    if (!checker || !symbol) {
        return symbol;
    }

    // We have to check first, because the TS TypeChecker will throw an
    // error if there is no alias
    if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
        return getAliasedSymbolIfNecessary(checker.getAliasedSymbol(symbol));
    }

    return symbol;
}

export function getSymbolAtLocation(node: ts.Node): ts.Symbol | undefined {
    const checker = Context.checker;

    let symbol = checker?.getSymbolAtLocation(node);

    if (!symbol && isNamedNode(node)) {
        symbol = checker?.getSymbolAtLocation(node.name);
    }

    return symbol;
}
