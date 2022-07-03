export enum JSDocTagType {
    DESCRIPTION,
    PARAM,
    RETURNS,
    TYPE,
    REFLECT,
    SUMMARY,
    DEFAULT,
    READONLY,
    DEPRECATED,
    EXAMPLE,
    OVERRIDE,
    SEE,
    SINCE,
    THROWS,
    PUBLIC,
    PRIVATE,
    PROTECTED,
}

/**
 * Represents a JSDoc tag
 *
 * See: https://jsdoc.app/
 */
export interface JSDoc {
    /**
     * The name of the tag
     */
    name: JSDocTagType;

    /**
     * The value assigned to the tag
     */
    value: string;
}
