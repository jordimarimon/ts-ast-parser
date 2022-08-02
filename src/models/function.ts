import { Parameter } from './parameter';
import { Decorator } from './decorator';
import { JSDoc } from './js-doc';
import { Type } from './type';


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
