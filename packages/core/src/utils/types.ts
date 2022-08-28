import ts from 'typescript';


export type FunctionLikeDeclaration = ts.FunctionDeclaration |
    ts.ArrowFunction |
    ts.MethodSignature |
    ts.FunctionExpression |
    ts.FunctionTypeNode |
    ts.MethodDeclaration |
    null;

export type NodeWithTypeParameter = ts.TypeAliasDeclaration |
    ts.InterfaceDeclaration |
    ts.ClassDeclaration |
    ts.ClassExpression |
    FunctionLikeDeclaration |
    null;

export type NodeWithParameters = FunctionLikeDeclaration |
    ts.SetAccessorDeclaration |
    ts.ConstructorDeclaration;

export type NodeWithHeritageClause = ts.InterfaceDeclaration | ts.ClassDeclaration | ts.ClassExpression;
