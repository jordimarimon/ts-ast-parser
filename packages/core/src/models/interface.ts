import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { MemberKind } from './member-kind.js';
import { FunctionLike } from './function.js';
import { PropertyLike } from './property.js';
import { Reference } from './reference.js';
import { ClassField } from './class.js';
import { JSDoc } from './js-doc.js';
import { Type } from './type.js';


export interface InterfaceMethod extends FunctionLike, PropertyLike {
    kind: MemberKind.Method;
}

export interface IndexSignature extends PropertyLike {
    kind: MemberKind.IndexSignature;
    indexType?: Type;
}

export interface InterfaceDeclaration {
    name: string;
    line: number;
    kind: DeclarationKind.Interface;
    properties?: ClassField[];
    indexSignatures?: IndexSignature[];
    methods?: InterfaceMethod[];
    jsDoc?: JSDoc;
    typeParameters?: TypeParameter[];
    heritage?: Reference[];
    namespace?: string;
}
