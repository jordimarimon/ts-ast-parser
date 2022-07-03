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

/**
 * We use internally this interface to define the nodes that make up
 * a JS mixin.
 */
export interface MixinNodes {
    /**
     * A mixin is a function but the function can be defined
     * as an arrow function throw a variable statement.
     */
    function: ts.FunctionDeclaration | ts.VariableStatement;

    /**
     * The mixin function defines a new class that inherits
     * a base class.
     */
    class: ts.ClassExpression | ts.ClassDeclaration;
}
