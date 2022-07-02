import { Decorator } from './decorator';
import { Type } from './type';


/**
 * The common interface of variables, class fields, and function
 * parameters.
 */
export interface PropertyLike {
    /**
     *
     */
    name: string;

    /**
     * A markdown description of the field.
     */
    description?: string;

    /**
     * The TypeScript type of the property
     */
    type?: Type;

    /**
     * The default value of the property if defined
     */
    default?: string;

    decorators: Decorator[];

    /**
     * Whether the property is deprecated.
     * If the value is a string, it's the reason for the deprecation.
     */
    deprecated?: boolean | string;
}
