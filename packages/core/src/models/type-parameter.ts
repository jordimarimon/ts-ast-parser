import type { Type } from './type.js';

/**
 * A type parameter after being serialized
 */
export interface TypeParameter {
    /**
     * The name of the type parameter
     */
    name: string;

    /**
     * The default value
     */
    default?: Type;

    /**
     * Any constraint defined in the type parameter.
     *
     * @example
     *
     *      T extends number | boolean
     */
    constraint?: Type;
}
