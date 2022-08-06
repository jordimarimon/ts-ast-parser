import { PropertyLike } from './property';
import { FunctionLike } from './function';
import { Reference } from './reference';
import { Decorator } from './decorator';
import { Parameter } from './parameter';
import { JSDoc } from './js-doc';


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
}

export interface ClassMethod extends FunctionLike {
    kind: 'method';
    static?: boolean;
    modifier?: ModifierType;
}

export interface Constructor {
    jsDoc: JSDoc;
    parameters: Parameter[];
}

export interface ClassLike {
    name: string;
    heritage?: Reference;
    constructors: Constructor[];
    members?: ClassMember[];
    decorators: Decorator[];
    jsDoc: JSDoc;
}

export interface ClassDeclaration extends ClassLike {
    kind: 'class';
}
