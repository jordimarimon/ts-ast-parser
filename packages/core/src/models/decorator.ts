import type { SourceReference } from './reference.js';
import type { DocComment } from './js-doc.js';

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
     * The JSDoc
     */
    jsDoc?: DocComment;

    /**
     * Where the decorator is defined
     */
    source?: SourceReference;
}
