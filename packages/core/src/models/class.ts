import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { MemberKind } from './member-kind.js';
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

export interface ClassMemberLike {
    static?: boolean;
    readOnly?: boolean;
    abstract?: boolean;
    override?: boolean;
    inherited?: boolean;
}

export interface ClassField extends PropertyLike, ClassMemberLike {
    kind: MemberKind.Property;
    writeOnly?: boolean;
}

export interface ClassMethod extends FunctionLike, ClassMemberLike {
    kind: MemberKind.Method;
}

export interface Constructor {
    jsDoc?: JSDoc;
    parameters?: readonly Parameter[];
}

export interface ClassDeclaration {
    name: string;
    line: number;
    kind: DeclarationKind.Class;
    properties?: readonly ClassField[];
    methods?: readonly ClassMethod[];
    jsDoc?: JSDoc;
    typeParameters?: readonly TypeParameter[];
    heritage?: readonly Reference[];
    decorators?: readonly Decorator[];
    constructors?: readonly Constructor[];
    abstract?: boolean;
    namespace?: string;
}
