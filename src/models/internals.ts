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

/**
 * Sourced from:
 * https://github.com/angular/tsickle/blob/e79f7837e2774f8fbbef695a1ab7471c27369548/src/tsickle.ts#L58-L76
 */
export interface JSDocTag {
    kind: ts.SyntaxKind.JSDocTag;
    comment?: string | undefined;
    tagName?: ts.Identifier;
    parameterName?: string;
    type?: string;
    optional?: boolean;
    restParam?: boolean;
    destructuring?: boolean;
    text?: string;
}

export interface MixinNodes {
    function: ts.FunctionDeclaration | ts.VariableStatement;
    class: ts.ClassExpression | ts.ClassDeclaration;
}
