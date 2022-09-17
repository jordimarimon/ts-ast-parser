import { Options } from './options.js';
import ts from 'typescript';


export interface ParserContext {
    checker: ts.TypeChecker | null;
    options: Partial<Options>;
    compilerOptions: ts.CompilerOptions;
    normalizePath: (path: string | undefined) => string;
}

/**
 * We define a context to be shared with all the functions.
 *
 * Context is defined only at the start of the parsing by the `parseFrom*` functions.
 */
export const Context: ParserContext = {

    checker: null,

    options: {},

    compilerOptions: {},

    // Normalizing the path depends on the environment (browser or NodeJS)
    normalizePath: path => path ?? '',

};
