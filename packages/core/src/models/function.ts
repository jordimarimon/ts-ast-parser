import type { TypeParameter } from './type-parameter.js';
import { DeclarationKind } from './declaration-kind.js';
import type { Parameter } from './parameter.js';
import type { Decorator } from './decorator.js';
import type { JSDoc } from './js-doc.js';
import type { Type } from './type.js';


export interface FunctionReturn {
    type: Type;
}

export interface FunctionSignature {
    line: number;
    parameters?: readonly Parameter[];
    typeParameters?: readonly TypeParameter[];
    return: FunctionReturn;
    jsDoc?: JSDoc;
}

export interface FunctionLike {
    name: string;
    signatures: readonly FunctionSignature[];
    namespace?: string;
    async?: boolean;
    generator?: boolean;
    decorators?: readonly Decorator[];
    jsDoc?: JSDoc;
}

export interface FunctionDeclaration extends FunctionLike {
    kind: DeclarationKind.Function;
}
