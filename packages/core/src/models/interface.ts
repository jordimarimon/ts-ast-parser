import type { TypeParameter } from './type-parameter.js';
import type { DeclarationKind } from './declaration-kind.js';
import type { PropertyLike } from './property.js';
import type { Field, Method } from './member.js';
import type { Reference } from './reference.js';
import type { MemberKind } from './member-kind.js';
import type { JSDoc } from './js-doc.js';
import type { Type } from './type.js';


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
    indexSignature?: IndexSignature;
    methods?: readonly Method[];
    jsDoc?: JSDoc;
    typeParameters?: readonly TypeParameter[];
    heritage?: readonly Reference[];
    namespace?: string;
}
