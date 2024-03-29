import type { TypeAliasDeclaration } from './type-alias.js';
import type { InterfaceDeclaration } from './interface.js';
import type { VariableDeclaration } from './variable.js';
import type { FunctionDeclaration } from './function.js';
import type { ClassDeclaration } from './class.js';
import type { EnumDeclaration } from './enum.js';


/**
 * What type of nodes are treated as declarations
 */
export type Declaration =
    | ClassDeclaration
    | InterfaceDeclaration
    | FunctionDeclaration
    | VariableDeclaration
    | EnumDeclaration
    | TypeAliasDeclaration;
