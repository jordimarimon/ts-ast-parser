import type { AnalyserDiagnostic } from './analyser-diagnostic.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import type ts from 'typescript';


/**
 * Returns true if we're executing inside a browser
 */
export const isBrowser = typeof document === 'object' && !!document;

/**
 * The context of the analyser.
 *
 * Contains useful utilities to help analyze the code.
 *
 * Every project has only one context.
 *
 * In a monorepo there will be one context per child project.
 */
export interface AnalyserContext {
    /**
     * A Program is an immutable collection of source files and the compiler options. Together
     * represent a compilation unit.
     */
    program: ts.Program;

    /**
     * The TypeScript type checker.
     *
     * Useful to resolve the types of the symbols and declarations.
     */
    checker: ts.TypeChecker;

    /**
     * The user provided analyzer options.
     */
    options: Partial<AnalyserOptions> | null;

    /**
     * Here we save all the errors we find while analysing the source files
     */
    diagnostics: AnalyserDiagnostic;

    /**
     * An abstraction layer around how we interact with the environment (browser or Node.js)
     */
    system: AnalyserSystem;
}
