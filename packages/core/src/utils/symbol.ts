import { Context } from '../context.js';
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
