import { Type } from './type';


/**
 * The common interface of variables, class fields, and function
 * parameters.
 */
export interface PropertyLike {
    name: string;

    /**
     * A markdown summary suitable for display in a listing.
     */
    summary?: string;

    /**
     * A markdown description of the field.
     */
    description?: string;

    type?: Type;

    default?: string;

    /**
     * Whether the property is deprecated.
     * If the value is a string, it's the reason for the deprecation.
     */
    deprecated?: boolean | string;
}
