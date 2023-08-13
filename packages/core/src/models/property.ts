import type { Decorator } from './decorator.js';
import type { JSDoc } from './js-doc.js';
import type { Type } from './type.js';

/**
 * A property-like definition.
 * Used by class/interface properties as well as for parameters.
 */
export interface PropertyLike {
    /**
     * Name of the property
     */
    name: string;

    /**
     * The start line number where the property is defined
     */
    line?: number;

    /**
     * The type of the property.
     * If it's an index signature, it will be the type of the object value.
     */
    type: Type;

    /**
     * The default value
     */
    default?: unknown;

    /**
     * Whether it's optional or not
     */
    optional?: boolean;

    /**
     * Any decorator that has been defined
     */
    decorators?: readonly Decorator[];

    /**
     * All the JSDoc comments
     */
    jsDoc?: JSDoc;
}
