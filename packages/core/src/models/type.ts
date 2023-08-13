import type { TypeParameter } from './type-parameter.js';
import type { SourceReference } from './reference.js';
import type { Field, Method } from './member.js';
import type { Parameter } from './parameter.js';


export enum TypeKind {
    Array = 'Array',
    Union = 'Union',
    Intersection = 'Intersection',
    ObjectLiteral = 'ObjectLiteral',
    Conditional = 'Conditional',
    Reference = 'Reference',
    Intrinsic = 'Intrinsic',
    Tuple = 'Tuple',
    NamedTupleMember = 'NamedTupleMember',
    Operator = 'Operator',
    Unknown = 'Unknown',
    IndexAccess = 'IndexAccess',
    Literal = 'Literal',
    Function = 'Function',
    Query = 'Query',
    Infer = 'Infer',
    Mapped = 'Mapped',
    Optional = 'Optional',
    Predicate = 'Predicate',
    Rest = 'Rest',
    TemplateLiteral = 'TemplateLiteral',
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
     * The base element type of:
     *      - Array type
     *      - Operator type
     *      - Optional type
     *      - Rest type
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

    /**
     * The type parameters in a function type node
     */
    typeParameters?: readonly TypeParameter[];

    /**
     * The parameters in a function type node
     */
    parameters?: readonly Parameter[];

    /**
     * The return type in a function type node
     */
    return?: Type;

    /**
     * The constraint in an infer type node
     */
    constraint?: Type;
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
