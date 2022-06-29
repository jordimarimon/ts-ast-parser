import ts from 'typescript';

// TS doesn't make publicly available the following types
// See: https://github.com/microsoft/TypeScript/issues/7393
// You can also view them in the TS AST Viewer enabling the `show internals` options

export interface JSDocNode extends ts.Node {
    jsDoc?: JSDocComment[];
}

export interface JSDocComment {
    kind: ts.SyntaxKind.JSDocComment;
    comment?: string | undefined;
    tags?: JSDocTag[];
}

export interface JSDocTag {
    kind: ts.SyntaxKind.JSDocTag;
    comment?: string | undefined;
    tagName?: ts.Identifier;
}
