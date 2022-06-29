import { SourceReference } from './reference';
import { TypeReference } from 'typescript';


export interface Type {
    /**
     * The full string representation of the type, in whatever type syntax is
     * used, such as JSDoc, Closure, or TypeScript.
     */
    text: string;

    /**
     * An array of references to the types in the type string.
     *
     * These references have optional indices into the type string so that tools
     * can understand the references in the type string independently of the type
     * system and syntax. For example, a documentation viewer could display the
     * type `Array<FooElement | BarElement>` with cross-references to `FooElement`
     * and `BarElement` without understanding arrays, generics, or union types.
     */
    references?: TypeReference[];

    source?: SourceReference;
}
