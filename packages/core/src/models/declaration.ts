import type { TypeAliasDeclaration } from './type-alias.js';
import type { InterfaceDeclaration } from './interface.js';
import type { VariableDeclaration } from './variable.js';
import type { FunctionDeclaration } from './function.js';
import type { ClassDeclaration } from './class.js';
import type { EnumDeclaration } from './enum.js';
import type { NamespaceDeclaration } from './namespace.js';


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

    /**
     * A namespace declaration
     */
    Namespace = 'Namespace',
}

/**
 * What type of nodes are treated as declarations
 */
export type Declaration =
    | ClassDeclaration
    | InterfaceDeclaration
    | FunctionDeclaration
    | VariableDeclaration
    | EnumDeclaration
    | TypeAliasDeclaration
    | NamespaceDeclaration;
