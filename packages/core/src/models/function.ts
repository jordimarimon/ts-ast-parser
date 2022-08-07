import { Parameter } from './parameter.js';
import { Decorator } from './decorator.js';
import { JSDoc } from './js-doc.js';
import { Type } from './type.js';


export interface FunctionReturn {
    type?: Type;
}

export interface FunctionLike {
    name: string;
    parameters: Parameter[];
    return: FunctionReturn;
    async?: boolean;
    decorators: Decorator[];
    jsDoc: JSDoc;
}

export interface FunctionDeclaration extends FunctionLike {
    kind: 'function';
}
