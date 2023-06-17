import type { SourceReference } from './reference.js';


/**
 * Result of a decorator after serializing it
 */
export interface Decorator {
    /**
     * The name of the decorator
     */
    name: string;

    /**
     * An array of the argument passed when calling the decorator
     */
    arguments?: unknown[];

    /**
     * Where the decorator is defined
     */
    source?: SourceReference;
}
