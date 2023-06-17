import type ts from 'typescript';


/**
 * Returns true if we're executing inside a browser
 */
export const isBrowser = typeof document === 'object' && !!document;

/**
 * The context of the analyzer.
 *
 * Contains useful utilities to help analyze the code.
 *
 * Every project has only one context.
 *
 * In a monorepo there will be one context per child project.
 */
export interface AnalyzerContext {
    /**
     * The TypeScript type checker.
     * Useful to resolve the types of the symbols and declarations.
     */
    checker: ts.TypeChecker;

    /**
     * The TypeScript compiler options.
     */
    compilerOptions: ts.CompilerOptions;

    /**
     * Normalizing the path depends on the environment (browser or NodeJS)
     */
    normalizePath: (path: string | undefined) => string;
}
