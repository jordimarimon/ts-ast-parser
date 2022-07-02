import { InterfaceDeclaration } from './interface';
import { VariableDeclaration } from './variable';
import { FunctionDeclaration } from './function';
import { ClassDeclaration } from './class';
import { MixinDeclaration } from './mixin';


/**
 * Defines what it's considered a declaration.
 *
 * We support extracting metadata from classes, functions,
 * variables, interfaces and mixins.
 */
export type Declaration =
    | ClassDeclaration
    | InterfaceDeclaration
    | FunctionDeclaration
    | MixinDeclaration
    | VariableDeclaration;
