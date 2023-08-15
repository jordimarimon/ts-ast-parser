/**
 * The different kinds of declarations
 */
export enum DeclarationKind {
    /**
     * A class declaration
     */
    Class = 'Class',

    /**
     * An interface declaration
     */
    Interface = 'Interface',

    /**
     * A function declaration
     */
    Function = 'Function',

    /**
     * A mixin declaration
     */
    Mixin = 'Mixin',

    /**
     * A variable declaration
     */
    Variable = 'Variable',

    /**
     * An enum declaration
     */
    Enum = 'Enum',

    /**
     * A type alias declaration
     */
    TypeAlias = 'TypeAlias',
}
