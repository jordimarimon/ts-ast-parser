import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from './symbol.js';
import { SymbolWithLocation } from './is.js';
import { AnalyzerContext } from '../context.js';
import { isThirdParty } from './import.js';
import ts from 'typescript';


export function getLocation(nodeOrType: ts.Node | ts.Type, context: AnalyzerContext): SymbolWithLocation {
    let symbol: ts.Symbol | undefined;

    if ('kind' in nodeOrType) {
        symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(nodeOrType, context.checker), context.checker);
    } else {
        symbol = nodeOrType.aliasSymbol ?? nodeOrType.getSymbol();
    }

    const decl = symbol?.getDeclarations()?.[0];
    const sourceFile = decl?.getSourceFile();
    const path = context.normalizePath(sourceFile?.fileName);

    return {
        symbol,
        line: decl ? getLinePosition(decl) : null,
        path: isThirdParty(path) ? '' : path,
    };
}

export function getLinePosition(node: ts.Node): number {
    return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
}
