import type { FunctionLike } from './function.js';
import type { PropertyLike } from './property.js';

/**
 * Type of visibility modifiers
 */
export enum ModifierType {
    public = 'public',
    private = 'private',
    protected = 'protected',
}

/**
 * The different type of members in a class/interface
 */
export enum MemberKind {
    /**
     * Represents a property of a class/interface/type-literal
     */
    Property = 'Property',

    /**
     * Represents a method of a class/interface/type-literal
     */
    Method = 'Method',

    /**
     * Represents an index signature in an interface or in a type literal.
     * Case of `{ [key: string]: number }`
     */
    IndexSignature = 'IndexSignature',
}

/**
 * Member like nodes after being serialized
 */
export interface MemberLike {
    /**
     * Whether the member is static or not
     */
    static?: boolean;

    /**
     * Whether the member is read only or not
     */
    readOnly?: boolean;

    /**
     * Whether the member is optional or not
     */
    optional?: boolean;

    /**
     * Whether the member is abstract or not
     */
    abstract?: boolean;

    /**
     * Whether this member overrides a parent member
     */
    override?: boolean;

    /**
     * Whether the member is inherited or not
     */
    inherited?: boolean;
}

/**
 * A class/interface property after being serialized
 */
export interface Field extends PropertyLike, MemberLike {
    /**
     * The type of member
     */
    kind: MemberKind.Property;

    /**
     * Whether the property is write-only or not.
     * It's write-only if only a setter has been defined.
     */
    writeOnly?: boolean;
}

/**
 * A class/interface method after being serialized
 */
export interface Method extends FunctionLike, MemberLike {
    /**
     * The type of member
     */
    kind: MemberKind.Method;
}
