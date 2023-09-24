import type { CommentPart } from '@ts-ast-parser/comment';
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
     * The JSDoc
     */
    jsDoc?: CommentPart[];

    /**
     * Where the decorator is defined
     */
    source?: SourceReference;
}
