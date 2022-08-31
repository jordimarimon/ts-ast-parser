import { TypeAliasDeclaration } from './type-alias.js';
import { InterfaceDeclaration } from './interface.js';
import { VariableDeclaration } from './variable.js';
import { FunctionDeclaration } from './function.js';
import { ClassDeclaration } from './class.js';
import { MixinDeclaration } from './mixin.js';
import { EnumDeclaration } from './enum.js';


export enum DeclarationKind {
    class = 'class',
    field = 'field',
    method = 'method',
    interface = 'interface',
    function = 'function',
    mixin = 'mixin',
    variable = 'variable',
    enum = 'enum',
    typeAlias = 'type-alias',
}

export type Declaration =
    | ClassDeclaration
    | InterfaceDeclaration
    | FunctionDeclaration
    | MixinDeclaration
    | VariableDeclaration
    | EnumDeclaration
    | TypeAliasDeclaration;
