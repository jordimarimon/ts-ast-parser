import { SourceReference } from './reference';


/**
 * Defines a TypeScript type
 */
export interface Type {
    /**
     * The full string representation of the type.
     */
    text: string;

    /**
     * A reference to where the type it's declared.
     */
    source?: SourceReference;
}
