import { Parameter } from './parameter';
import { Decorator } from './decorator';
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
    decorators: Decorator[];
}

/**
 *
 */
export interface FunctionDeclaration extends FunctionLike {
    kind: 'function';
}
