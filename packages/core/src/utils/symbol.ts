import { Context } from '../context.js';
import ts from 'typescript';


export function getAliasedSymbolIfNecessary(symbol: ts.Symbol): ts.Symbol {
    const checker = Context.checker;

    if (!checker) {
        return symbol;
    }

    // We have to check first, because the TS TypeChecker will throw an
    // error if there no alias
    if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
        return checker.getAliasedSymbol(symbol);
    }

    return symbol;
}
