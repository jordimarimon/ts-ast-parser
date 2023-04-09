import { DeclarationKind } from './declaration-kind.js';
import { FunctionSignature } from './function.js';
import { Field, Method } from './member.js';
import { Decorator } from './decorator.js';
import { JSDoc } from './js-doc.js';
import ts from 'typescript';


export interface MixinNodes {
    function: ts.FunctionDeclaration | ts.VariableStatement;
    class: ts.ClassExpression | ts.ClassDeclaration;
}

export interface MixinDeclaration {
    name: string;
    kind: DeclarationKind.Mixin;
    signatures: readonly FunctionSignature[];
    namespace?: string;
    decorators?: readonly Decorator[];
    jsDoc?: JSDoc;
    properties?: readonly Field[];
    methods?: readonly Method[];
    constructors?: readonly FunctionSignature[];
}
