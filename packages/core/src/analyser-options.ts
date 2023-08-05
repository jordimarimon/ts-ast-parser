import type ts from 'typescript';


/**
 * The analyser options
 */
export interface AnalyserOptions {
    /**
     * Allows you to manually specify the path to a TSConfig file.
     *
     * Expects a relative path to the current working directory.
     */
    tsConfigFilePath: string;

    /**
     * If true, it won't stop the analysis when there are semantics errors in the code.
     * @default false
     */
    skipDiagnostics: boolean;

    /**
     * Allows you to override the default compiler options to use when analyzing the source files
     *
     * @see https://www.typescriptlang.org/tsconfig#compilerOptions
     */
    compilerOptions: ts.CompilerOptions;

    /**
     * Allows you to define which files get included in the analysis
     * in cases where there is no TSConfig file available
     */
    include: string[];

    /**
     * Allows you to define which files get excluded in the analysis
     * in cases where there is no TSConfig file available
     */
    exclude: string[];

    /**
     * Whether the project represents a JS project
     * @default false
     */
    jsProject: boolean;
}
