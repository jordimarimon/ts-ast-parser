import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { MemberKind } from './member-kind.js';
import { PropertyLike } from './property.js';
import { Field, Method } from './member.js';
import { Reference } from './reference.js';
import { JSDoc } from './js-doc.js';
import { Type } from './type.js';


export interface IndexSignature extends PropertyLike {
    kind: MemberKind.IndexSignature;
    indexType?: Type;
    readOnly?: boolean;
}

export interface InterfaceDeclaration {
    name: string;
    line: number;
    kind: DeclarationKind.Interface;
    properties?: readonly Field[];
    staticProperties?: readonly Field[];
    indexSignature?: IndexSignature;
    methods?: readonly Method[];
    staticMethods?: readonly Method[];
    jsDoc?: JSDoc;
    typeParameters?: readonly TypeParameter[];
    heritage?: readonly Reference[];
    namespace?: string;
}
