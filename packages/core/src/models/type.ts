import type { SourceReference } from './reference.js';
import type { Field, Method } from './member.js';


export enum TypeKind {
    Array = 'Array',
    Union = 'Union',
    Intersection = 'Intersection',
    ObjectLiteral = 'ObjectLiteral',
    Conditional = 'Conditional',
    Reference = 'Reference',
    Primitive = 'Primitive',
    Tuple = 'Tuple',
    NamedTupleMember = 'NamedTupleMember',
    Operator = 'Operator',
    Unknown = 'Unknown',
    Literal = 'Literal',
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
    kind: TypeKind;

    /**
     * The object literal type properties
     */
    properties?: readonly Field[];

    /**
     * The object literal type methods
     */
    methods?: readonly Method[];

    /**
     * The union, intersection or tuple members.
     */
    elements?: readonly (Type | NamedTupleMember)[];

    /**
     * The base element type of array or an operator
     */
    elementType?: Type;

    /**
     * The location of the symbol if it's a type reference
     */
    source?: SourceReference;

    /**
     * The type arguments in a type reference
     */
    typeArguments?: readonly Type[];
}

/**
 * The member of a tuple type
 */
export interface NamedTupleMember extends Type {
    /**
     * The name of the member
     */
    name: string;

    /**
     * If the tuple member is optional
     */
    optional?: boolean;
}
