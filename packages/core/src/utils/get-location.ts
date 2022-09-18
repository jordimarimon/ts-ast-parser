import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from './symbol.js';
import { SymbolWithLocation } from './types.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function getLocation(node: ts.Node): SymbolWithLocation {
    const symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(node));
    const decl = symbol?.getDeclarations()?.[0];
    const sourceFile = decl?.getSourceFile();

    return {
        symbol,
        path: Context.normalizePath(sourceFile?.fileName),
    };
}
