import type { TypeAliasDeclaration } from './type-alias.js';
import type { InterfaceDeclaration } from './interface.js';
import type { VariableDeclaration } from './variable.js';
import type { FunctionDeclaration } from './function.js';
import type { ClassDeclaration } from './class.js';
import type { MixinDeclaration } from './mixin.js';
import type { EnumDeclaration } from './enum.js';


export type Declaration =
    | ClassDeclaration
    | InterfaceDeclaration
    | FunctionDeclaration
    | MixinDeclaration
    | VariableDeclaration
    | EnumDeclaration
    | TypeAliasDeclaration;
