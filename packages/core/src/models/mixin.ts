import type { DeclarationKind } from './declaration-kind.js';
import type { FunctionSignature } from './function.js';
import type { Field, Method } from './member.js';
import type { Decorator } from './decorator.js';
import type { JSDoc } from './js-doc.js';
import type ts from 'typescript';


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
