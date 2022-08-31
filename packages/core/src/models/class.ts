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
}

export interface ClassField extends PropertyLike, ClassMemberLike {
    kind: 'field';
    writeOnly?: boolean;
}

export interface ClassMethod extends FunctionLike, ClassMemberLike {
    kind: 'method';
}

export interface Constructor {
    jsDoc?: JSDoc;
    parameters?: Parameter[];
}

export interface ClassLike {
    name: string;
    members?: ClassMember[];
    jsDoc?: JSDoc;
    typeParameters?: string[];
    heritage?: Reference[];
    decorators?: Decorator[];
    ctor?: Constructor;
    abstract?: boolean;
}

export interface ClassDeclaration extends ClassLike {
    kind: 'class';
}
