import type { SourceReference } from './reference.js';
import type { Field, Method } from './member.js';


export enum TypeKind {
    Array = 'Array',
    Union = 'Union',
    Intersection = 'Intersection',
    Literal = 'Literal',
    Conditional = 'Conditional',
    Reference = 'Reference',
    Primitive = 'Primitive',
    Tuple = 'Tuple',
}

/**
 * A type after being serialized
 */
export interface Type {
    /**
     * The raw text value of the type
     */
    text: string;

    /**
     * The kind of the type
     */
    kind?: TypeKind;

    /**
     * The object literal type properties
     */
    properties?: readonly Field[];

    /**
     * The object literal type methods
     */
    methods?: readonly Method[];

    /**
     * The union or intersection types.
     */
    elements?: readonly Type[];

    /**
     * The element type of array type
     */
    elementType?: Type | null;

    /**
     * The name of the tuple named element
     */
    name?: string;

    /**
     * The location of the symbol
     */
    source?: SourceReference;
}
