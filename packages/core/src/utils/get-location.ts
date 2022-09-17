import { getAliasedSymbolIfNecessary } from './symbol.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function getLocation(node: ts.Node): {path: string; decl: ts.Declaration | undefined} {
    const checker = Context.checker;
    const symbol = getAliasedSymbolIfNecessary(checker?.getSymbolAtLocation(node));
    const decl = symbol?.getDeclarations()?.[0];
    const sourceFile = decl?.getSourceFile();

    return {
        decl,
        path: Context.normalizePath(sourceFile?.fileName),
    };
}
