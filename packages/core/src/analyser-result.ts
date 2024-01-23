import type { AnalyserError } from './analyser-diagnostic.js';
import type { Project } from './project.js';


/**
 * Represents the result of calling any of
 * the parsing functions
 */
export interface AnalyserResult {
    /**
     * A project node contains a collection of
     * modules that have been successfully analysed
     */
    project: Project | null;

    /**
     * In case there have been errors during the
     * analysis, you will find them here
     */
    errors: AnalyserError[];
}
