import { Parameter } from './parameter';
import { Type } from './type';
import { Decorator } from './decorator';


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
    parameters?: Parameter[];

    /**
     *
     */
    return?: FunctionReturn;

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
