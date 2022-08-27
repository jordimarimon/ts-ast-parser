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

export interface ClassField extends PropertyLike {
    kind: 'field';
    static?: boolean;
    modifier?: ModifierType;
    readOnly?: boolean;
    writeOnly?: boolean;
}

export interface ClassMethod extends FunctionLike {
    kind: 'method';
    static?: boolean;
    modifier?: ModifierType;
    readOnly?: boolean;
}

export interface Constructor {
    jsDoc: JSDoc;
    parameters: Parameter[];
}

export interface ClassLike {
    name: string;
    heritage?: Reference[];
    ctor?: Constructor;
    members?: ClassMember[];
    decorators: Decorator[];
    typeParameters: string[];
    jsDoc: JSDoc;
}

export interface ClassDeclaration extends ClassLike {
    kind: 'class';
}
