/**
 * See: https://jsdoc.app/
 */
export enum JSDocTagType {
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
    see = 'see',
    since = 'since',
    throws = 'throws',
    public = 'public',
    private = 'private',
    protected = 'protected',
    internal = 'internal',
    ignore = 'ignore',
    category = 'category',
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

export type JSDoc = {
    [JSDocTagType.description]: string;
    [JSDocTagType.type]: string;
    [JSDocTagType.default]: string;
    [JSDocTagType.deprecated]: boolean;
    [JSDocTagType.readonly]: boolean;
    [JSDocTagType.see]: string;
    [JSDocTagType.category]: string;
    [JSDocTagType.tag]: string;
    [JSDocTagType.tagname]: string;
    [JSDocTagType.since]: string;
    [JSDocTagType.ignore]: boolean;
    [JSDocTagType.internal]: boolean;
    [JSDocTagType.private]: boolean;
    [JSDocTagType.protected]: boolean;
    [JSDocTagType.public]: boolean;
    [key: string]: unknown;
};
