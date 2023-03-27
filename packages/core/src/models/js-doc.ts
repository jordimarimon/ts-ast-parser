import ts from 'typescript';


/**
 * See: https://jsdoc.app/
 */
export enum JSDocTagName {
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
    protected = 'protected',
    private = 'private',
    internal = 'internal',
    ignore = 'ignore',
    category = 'category',
    typedef = 'typedef',
    typeParam = 'typeParam',

    // Custom Elements
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

export type JSDocTagObjectValue = {
    [key: string]: unknown;
    name?: string;
    type?: string;
    value?: unknown;
    default?: string;
    optional?: boolean;
    description?: string;
};

export type JSDocTagValue = JSDocTagObjectValue | string | boolean;

export type JSDocResult =
    { kind: JSDocTagName.description; value: string } |
    { kind: JSDocTagName.param; value: { name: string; default: string; optional: boolean; description: string } } |
    { kind: JSDocTagName.returns; value: string } |
    { kind: JSDocTagName.type; value: string } |
    { kind: JSDocTagName.summary; value: string } |
    { kind: JSDocTagName.default; value: string } |
    { kind: JSDocTagName.readonly; value: boolean } |
    { kind: JSDocTagName.deprecated; value: boolean } |
    { kind: JSDocTagName.example; value: string } |
    { kind: JSDocTagName.override; value: boolean } |
    { kind: JSDocTagName.see; value: string } |
    { kind: JSDocTagName.since; value: string } |
    { kind: JSDocTagName.throws; value: string } |
    { kind: JSDocTagName.public; value: boolean } |
    { kind: JSDocTagName.protected; value: boolean } |
    { kind: JSDocTagName.private; value: boolean } |
    { kind: JSDocTagName.internal; value: boolean } |
    { kind: JSDocTagName.ignore; value: boolean } |
    { kind: JSDocTagName.category; value: string } |
    { kind: JSDocTagName.typedef; value: { name: string; type: string } } |
    { kind: JSDocTagName.typeParam; value: { name: string; default?: string; description: string } } |
    { kind: JSDocTagName.reflect; value: boolean } |
    { kind: JSDocTagName.cssprop; value: { name: string; default: string; description: string } } |
    { kind: JSDocTagName.cssproperty; value: { name: string; default: string; description: string } } |
    { kind: JSDocTagName.csspart; value: { name: string; description: string } } |
    { kind: JSDocTagName.slot; value: { name: string; description: string } } |
    { kind: JSDocTagName.attr; value: { name: string; description: string } } |
    { kind: JSDocTagName.fires; value: { name: string; type: string; description: string } } |
    { kind: JSDocTagName.event; value: { name: string; type: string; description: string } } |
    { kind: JSDocTagName.tag; value: string } |
    { kind: JSDocTagName.tagname; value: string } |
    { kind: string; value: JSDocTagValue };

export type JSDoc = JSDocResult[];

//
// TS doesn't make publicly available the following types
// See: https://github.com/microsoft/TypeScript/issues/7393
// You can also view them in the TS AST Viewer enabling the `show internals` options
//

export interface JSDocNode extends ts.Node {
    jsDoc?: JSDocComment[];
}

export interface JSDocComment extends ts.Node {
    kind: ts.SyntaxKind.JSDocComment;
    comment?: string;
    tags?: ts.JSDocTag[];
}
