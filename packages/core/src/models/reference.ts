import type { DeclarationKind } from './declaration-kind.js';

/**
 * Represents the location of a symbol
 */
export interface Reference {
    /**
     * The name of the symbol
     */
    name: string;

    /**
     * The type of declaration
     */
    kind?: DeclarationKind;

    /**
     * The location of the symbol
     */
    source?: SourceReference;
}

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
