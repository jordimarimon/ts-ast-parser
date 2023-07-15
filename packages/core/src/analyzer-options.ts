import type ts from 'typescript';


/**
 * The analyzer options
 */
export interface AnalyzerOptions {
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
     * Whether the project represents a JS project
     */
    jsProject: boolean;
}
