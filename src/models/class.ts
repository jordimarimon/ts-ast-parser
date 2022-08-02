import { PropertyLike } from './property';
import { FunctionLike } from './function';
import { Reference } from './reference';
import { Decorator } from './decorator';
import { JSDoc } from './js-doc';
import { Parameter } from './parameter';


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
    inheritedFrom?: Reference;
}

export interface ClassMethod extends FunctionLike {
    kind: 'method';
    static?: boolean;
    modifier?: ModifierType;
    inheritedFrom?: Reference;
}

export interface Constructor {
    description?: string;
    parameters: Parameter[];
}

export interface ClassLike {
    name: string;
    description?: string;
    superclasses?: Reference;
    constructors: Constructor[];
    members?: ClassMember[];
    decorators: Decorator[];
    jsDoc: JSDoc;
}

export interface ClassDeclaration extends ClassLike {
    kind: 'class';
}
