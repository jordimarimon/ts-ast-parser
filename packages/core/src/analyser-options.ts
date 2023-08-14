import type { AnalyserSystem } from './analyser-system.js';


/**
 * The analyser options
 */
export interface AnalyserOptions {
    /**
     * Allows you to manually specify the path to a TSConfig file.
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
    compilerOptions: Record<string, unknown>;

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

    /**
     * An abstraction layer around how the analyser interacts with the environment (browser or Node.js)
     */
    system: AnalyserSystem;
}
