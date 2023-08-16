import type { SourceReference } from './reference.js';


/**
 * Common documentation tag names (we support any tag name, these are just common ones, so
 * we don't have to use strings to refer to them).
 *
 * @see https://jsdoc.app/
 */
export enum DocTagName {
    description = 'description',
    param = 'param',
    returns = 'returns',
    type = 'type',
    summary = 'summary',
    default = 'default',
    readonly = 'readonly',
    deprecated = 'deprecated',
    example = 'example',
    override = 'override',
    overview = 'overview',
    license = 'license',
    see = 'see',
    since = 'since',
    throws = 'throws',
    public = 'public',
    protected = 'protected',
    private = 'private',
    internal = 'internal',
    ignore = 'ignore',
    category = 'category',
    typedef = 'typedef',
    typeParam = 'typeParam',
    version = 'version',
    exception = 'exception',
    kind = 'kind',
    author = 'author',

    // Custom Elements specific tags
    reflect = 'reflect',
    cssprop = 'cssprop',
    cssproperty = 'cssproperty',
    csspart = 'csspart',
    slot = 'slot',
    attr = 'attr',
    fires = 'fires',
    event = 'event',
    tag = 'tag',
    tagname = 'tagname',
}

/**
 * A documentation comment tag reflected value as an object
 */
export interface DocTagObjectValue {
    name?: string;
    type?: string;
    value?: unknown;
    default?: string;
    optional?: boolean;
    description?: string;

    /**
     * Indicates which reflection/url it links to. Useful
     * for `@link` tags
     */
    target?: string | SourceReference;

    /**
     * Text that should be displayed as the link text
     */
    linkText?: string;
}

/**
 * A documentation comment tag reflected value
 */
export type DocTagValue = DocTagObjectValue | string | boolean;

/**
 * A reflected documentation comment is an array of reflected tags
 */
export type DocComment = { kind: string; value: DocTagValue }[];
