import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { Parameter } from './parameter.js';
import { Decorator } from './decorator.js';
import { JSDoc } from './js-doc.js';
import { Type } from './type.js';


export interface FunctionReturn {
    type: Type;
}

export interface FunctionSignature {
    line: number;
    parameters?: Parameter[];
    typeParameters?: TypeParameter[];
    return: FunctionReturn;
    jsDoc?: JSDoc;
}

export interface FunctionLike {
    name: string;
    namespace?: string;
    async?: boolean;
    generator?: boolean;
    decorators?: Decorator[];
    jsDoc?: JSDoc;
    signatures: FunctionSignature[];
}

export interface FunctionDeclaration extends FunctionLike {
    kind: DeclarationKind.function;
}
