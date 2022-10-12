import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { Parameter } from './parameter.js';
import { Decorator } from './decorator.js';
import { JSDoc } from './js-doc.js';
import { Type } from './type.js';


export interface FunctionReturn {
    type: Type;
}

export interface FunctionLike {
    name: string;
    line: number;
    parameters?: Parameter[];
    typeParameters?: TypeParameter[];
    return: FunctionReturn;
    async?: boolean;
    generator?: boolean;
    decorators?: Decorator[];
    jsDoc?: JSDoc;
}

export interface FunctionDeclaration extends FunctionLike {
    kind: DeclarationKind.function;
}
