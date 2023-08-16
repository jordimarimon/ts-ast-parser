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
