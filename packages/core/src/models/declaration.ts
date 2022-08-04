import { TypeAliasDeclaration } from './type-alias';
import { InterfaceDeclaration } from './interface';
import { VariableDeclaration } from './variable';
import { FunctionDeclaration } from './function';
import { ClassDeclaration } from './class';
import { MixinDeclaration } from './mixin';
import { EnumDeclaration } from './enum';


export type Declaration =
    | ClassDeclaration
    | InterfaceDeclaration
    | FunctionDeclaration
    | MixinDeclaration
    | VariableDeclaration
    | EnumDeclaration
    | TypeAliasDeclaration;
