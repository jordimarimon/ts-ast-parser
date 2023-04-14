import type { TypeParameter } from './type-parameter.js';
import { DeclarationKind } from './declaration-kind.js';
import type { FunctionSignature } from './function.js';
import type { Field, Method } from './member.js';
import type { Reference } from './reference.js';
import type { Decorator } from './decorator.js';
import type { JSDoc } from './js-doc.js';


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
