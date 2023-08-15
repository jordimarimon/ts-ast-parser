import type { TypeParameter } from './type-parameter.js';
import type { SourceReference } from './reference.js';
import type { Field, Method } from './member.js';
import type { Parameter } from './parameter.js';


/**
 * Represents all the different kinds of types that the analyser reflects
 */
export enum TypeKind {
    /**
     * An array type. For example: `type foo = string[]`
     */
    Array = 'Array',

    /**
     * A union type. For example: `type foo = string | number`
     */
    Union = 'Union',

    /**
     * An intersection type. For example: `type foo = string & number`
     */
    Intersection = 'Intersection',

    /**
     * A type literal. For example: `type foo = {a: number}`
     */
    ObjectLiteral = 'ObjectLiteral',

    /**
     * A conditional type. For example: `type foo<T> = T extends boolean ? 1 : 0`
     */
    Conditional = 'Conditional',

    /**
     * A type reference. For example: `type foo = HTMLElement`
     */
    Reference = 'Reference',

    /**
     * An intrinsic type. For example: `type foo = string` or `type foo = object`
     */
    Intrinsic = 'Intrinsic',

    /**
     * A tuple type. For example: `type foo = [number, number]`
     */
    Tuple = 'Tuple',

    /**
     * A named tuple member. For example: `type foo = [name: string]`
     */
    NamedTupleMember = 'NamedTupleMember',

    /**
     * A type operator. For example: `type foo = readonly string[]`
     */
    Operator = 'Operator',

    /**
     * An unknown type represents any type that we don't have a match for it
     */
    Unknown = 'Unknown',

    /**
     * An index access type. For example: `type foo = HTMLElement['lang']`
     */
    IndexAccess = 'IndexAccess',

    /**
     * A literal type. For example: `type foo = 4`
     */
    Literal = 'Literal',

    /**
     * A function type. For example: `type foo = () => void`
     */
    Function = 'Function',

    /**
     * A query type. For example: `type foo = typeof Bar`
     */
    Query = 'Query',

    /**
     * An inferred type. For example: `type foo = Promise<string> extends Promise<infer U> ? U : never`
     */
    Infer = 'Infer',

    /**
     * A mapped type. For example: `type foo = { [Property in keyof T]: boolean; }`
     */
    Mapped = 'Mapped',

    /**
     * An optional type. For example: `type foo = [1, 2?]`
     */
    Optional = 'Optional',

    /**
     * A predicate type. For example: `function isString(x: unknown): x is string {...}`
     */
    Predicate = 'Predicate',

    /**
     * A rest type. For example: `type foo = [1, ...2[]]`
     */
    Rest = 'Rest',

    /**
     * A template literal type. For example: `` type foo = `${'a' | 'b'}${'a' | 'b'}` ``
     */
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
