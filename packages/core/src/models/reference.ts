/**
 * Represents a location
 */
export interface SourceReference {
    /**
     * The start line number
     */
    line?: number;

    /**
     * The file path relative to the current working directory
     */
    path?: string;
}
