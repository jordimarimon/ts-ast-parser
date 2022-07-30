import ts from 'typescript';

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

export interface MixinNodes {
    function: ts.FunctionDeclaration | ts.VariableStatement;
    class: ts.ClassExpression | ts.ClassDeclaration;
}
