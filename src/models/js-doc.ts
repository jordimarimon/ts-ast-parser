import ts from 'typescript';


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
    protected = 'protected',
    private = 'private',
    internal = 'internal',
    ignore = 'ignore',
    category = 'category',
    typedef = 'typedef',

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

export type JSDoc = {
    [JSDocTagType.description]: string;
    [JSDocTagType.param]: {name: string; default: string; options: boolean; description: string};
    [JSDocTagType.returns]: string;
    [JSDocTagType.type]: string;
    [JSDocTagType.summary]: string;
    [JSDocTagType.default]: string;
    [JSDocTagType.readonly]: boolean;
    [JSDocTagType.deprecated]: boolean;
    [JSDocTagType.example]: string;
    [JSDocTagType.override]: boolean;
    [JSDocTagType.see]: string;
    [JSDocTagType.since]: string;
    [JSDocTagType.throws]: string;
    [JSDocTagType.public]: boolean;
    [JSDocTagType.protected]: boolean;
    [JSDocTagType.private]: boolean;
    [JSDocTagType.internal]: boolean;
    [JSDocTagType.ignore]: boolean;
    [JSDocTagType.category]: string;

    // Custom Elements
    [JSDocTagType.reflect]: boolean;
    [JSDocTagType.cssprop]: {name: string; default: string; description: string};
    [JSDocTagType.cssproperty]: {name: string; default: string; description: string};
    [JSDocTagType.csspart]: {name: string; description: string};
    [JSDocTagType.slot]: {name: string; description: string};
    [JSDocTagType.attr]: {name: string; description: string};
    [JSDocTagType.fires]: {name: string; type: string; description: string};
    [JSDocTagType.event]: {name: string; type: string; description: string};
    [JSDocTagType.tag]: string;
    [JSDocTagType.tagname]: string;

    // Custom
    [key: string]: unknown;
};

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
