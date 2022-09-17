import { DeclarationKind } from './declaration-kind.js';
import { FunctionLike } from './function.js';
import { ClassLike } from './class.js';
import ts from 'typescript';


export interface MixinNodes {
    function: ts.FunctionDeclaration | ts.VariableStatement;
    class: ts.ClassExpression | ts.ClassDeclaration;
}

export interface MixinDeclaration extends FunctionLike, ClassLike {
    kind: DeclarationKind.mixin;
}
