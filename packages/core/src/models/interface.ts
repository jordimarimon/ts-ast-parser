import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { MemberKind } from './member-kind.js';
import { FunctionLike } from './function.js';
import { PropertyLike } from './property.js';
import { Reference } from './reference.js';
import { ClassField } from './class.js';
import { JSDoc } from './js-doc.js';
import { Type } from './type.js';


export interface InterfaceMethod extends FunctionLike {
    kind: MemberKind.Method;
    optional?: boolean;
}

export interface IndexSignature extends PropertyLike {
    kind: MemberKind.IndexSignature;
    indexType?: Type;
    readOnly?: boolean;
}

export interface InterfaceDeclaration {
    name: string;
    line: number;
    kind: DeclarationKind.Interface;
    properties?: readonly ClassField[];
    staticProperties?: readonly ClassField[];
    indexSignature?: IndexSignature;
    methods?: readonly InterfaceMethod[];
    staticMethods?: readonly InterfaceMethod[];
    jsDoc?: JSDoc;
    typeParameters?: readonly TypeParameter[];
    heritage?: readonly Reference[];
    namespace?: string;
}
