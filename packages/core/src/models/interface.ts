import { ClassField, ClassLike, ClassMethod } from './class.js';
import { DeclarationKind } from './declaration-kind.js';
import { Type } from './type.js';


export type InterfaceMember = InterfaceField | ClassMethod;

export interface InterfaceField extends ClassField {
    indexType?: Type;
    indexSignature?: boolean;
}

export interface InterfaceDeclaration extends ClassLike {
    kind: DeclarationKind.Interface;
    members?: InterfaceMember[];
}
