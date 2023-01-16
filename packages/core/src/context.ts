import ts from 'typescript';


export interface AnalyzerContext {
    checker: ts.TypeChecker | null;
    compilerOptions: ts.CompilerOptions;
    normalizePath: (path: string | undefined) => string;
}

/**
 * This defines the global context that can be accessed from anywhere.
 *
 * Context is defined only at the start of the parsing by the `parseFrom*` function.
 */
export const Context: AnalyzerContext = {

    checker: null,

    compilerOptions: {},

    // Normalizing the path depends on the environment (browser or NodeJS)
    normalizePath: path => path ?? '',

};
