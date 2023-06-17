import type { SourceReference } from './reference.js';


/**
 * Represents where a type has been defined
 */
export type TypeReference = {text: string} & SourceReference;

/**
 * A type after being serialized
 */
export interface Type {
    /**
     * The raw text value of the type
     */
    text: string;

    /**
     * Types can be the composition of multiple types (UnionTypes, IntersectionTypes, etc...).
     * Here we save where each individual type that is made of.
     */
    sources?: TypeReference[];
}
