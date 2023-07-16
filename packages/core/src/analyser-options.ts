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
     * Allows you to override the default compiler options to use when analyzing the source files
     *
     * @see https://www.typescriptlang.org/tsconfig#compilerOptions
     */
    compilerOptions: ts.CompilerOptions;

    /**
     * Allows you to define which files get included in the analysis
     * in cases where there is not TSConfig file available
     */
    include: string[];

    /**
     * Whether the project represents a JS project
     */
    jsProject: boolean;
}
