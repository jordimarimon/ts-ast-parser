import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { PropertyLike } from './property.js';
import { FunctionLike } from './function.js';
import { Reference } from './reference.js';
import { Decorator } from './decorator.js';
import { Parameter } from './parameter.js';
import { JSDoc } from './js-doc.js';


export enum ModifierType {
    public = 'public',
    private = 'private',
    protected = 'protected',
}

export type ClassMember = ClassField | ClassMethod;

export interface ClassMemberLike {
    static?: boolean;
    modifier?: ModifierType;
    readOnly?: boolean;
    abstract?: boolean;
    override?: boolean;
    inherited?: boolean;
}

export interface ClassField extends PropertyLike, ClassMemberLike {
    kind: DeclarationKind.field;
    writeOnly?: boolean;
}

export interface ClassMethod extends FunctionLike, ClassMemberLike {
    kind: DeclarationKind.method;
}

export interface Constructor {
    jsDoc?: JSDoc;
    parameters?: Parameter[];
}

export interface ClassLike {
    name: string;
    line: number;
    members?: ClassMember[];
    jsDoc?: JSDoc;
    typeParameters?: TypeParameter[];
    heritage?: Reference[];
    decorators?: Decorator[];
    constructors?: Constructor[];
    abstract?: boolean;
}

export interface ClassDeclaration extends ClassLike {
    kind: DeclarationKind.class;
}
