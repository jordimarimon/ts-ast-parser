import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { FunctionSignature } from './function.js';
import { Field, Method } from './member.js';
import { Reference } from './reference.js';
import { Decorator } from './decorator.js';
import { JSDoc } from './js-doc.js';


export interface ClassDeclaration {
    name: string;
    line: number;
    kind: DeclarationKind.Class;
    properties?: readonly Field[];
    staticProperties?: readonly Field[];
    methods?: readonly Method[];
    staticMethods?: readonly Method[];
    jsDoc?: JSDoc;
    typeParameters?: readonly TypeParameter[];
    heritage?: readonly Reference[];
    decorators?: readonly Decorator[];
    constructors?: readonly FunctionSignature[];
    abstract?: boolean;
    namespace?: string;
    customElement?: boolean;
}
