import type { AnalyserSystem } from './system/analyser-system.js';


/**
 * All the options that the analyser supports.
 * You can provide them in any parse function.
 */
export interface AnalyserOptions {
    /**
     * Allows you to manually specify the
     * path to a TSConfig file.
     */
    tsConfigFilePath: string;

    /**
     * If true, it won't stop the analysis when there
     * are syntactic or semantic errors in the code.
     *
     * @default false
     */
    skipDiagnostics: boolean;

    /**
     * Allows you to override the default compiler
     * options to use when analyzing the source files
     *
     * @see {@link https://www.typescriptlang.org/tsconfig#compilerOptions | CompilerOptions}
     */
    compilerOptions: Record<string, unknown>;

    /**
     * Allows you to define which files get
     * included in the analysis
     */
    include: string[];

    /**
     * Allows you to define which files get
     * excluded in the analysis
     */
    exclude: string[];

    /**
     * Whether the project represents a JS project
     * (all source files are JavaScript files)
     *
     * @default false
     */
    jsProject: boolean;

    /**
     * An abstraction layer around how the analyser
     * interacts with the environment (browser or Node.js)
     */
    system: AnalyserSystem;
}
