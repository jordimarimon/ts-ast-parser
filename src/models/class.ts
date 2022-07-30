import { PropertyLike } from './property';
import { FunctionLike } from './function';
import { Reference } from './reference';
import { Decorator } from './decorator';
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
    inheritedFrom?: Reference;
}

export interface ClassMethod extends FunctionLike {
    kind: 'method';
    static?: boolean;
    modifier?: ModifierType;
    inheritedFrom?: Reference;
}

export interface ClassLike {
    name: string;
    description?: string;
    superclass?: Reference;
    mixins?: Reference[];
    members?: ClassMember[];
    decorators: Decorator[];
    jsDoc: Partial<JSDoc>;
}

export interface ClassDeclaration extends ClassLike {
    kind: 'class';
}
