import { Parameter } from './parameter';
import { Decorator } from './decorator';
import { JSDoc } from './js-doc';
import { Type } from './type';


/**
 *
 */
export interface FunctionReturn {
    /**
     *
     */
    type?: Type;

    /**
     *
     */
    description?: string;
}

/**
 *
 */
export interface FunctionLike {
    /**
     *
     */
    name: string;

    /**
     * A markdown description.
     */
    description?: string;

    /**
     *
     */
    parameters: Parameter[];

    /**
     *
     */
    return: FunctionReturn;

    /**
     *
     */
    async?: boolean;

    /**
     *
     */
    decorators: Decorator[];

    /**
     *
     */
    jsDoc: Partial<JSDoc>;
}

/**
 *
 */
export interface FunctionDeclaration extends FunctionLike {
    kind: 'function';
}
