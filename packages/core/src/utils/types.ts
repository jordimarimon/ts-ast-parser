import ts from 'typescript';


export type FunctionLikeDeclaration = ts.FunctionDeclaration |
    ts.ArrowFunction |
    ts.MethodSignature |
    ts.FunctionExpression |
    ts.FunctionTypeNode |
    ts.MethodDeclaration |
    null;

export type ConstructWithTypeParameter = ts.TypeAliasDeclaration |
    ts.InterfaceDeclaration |
    ts.ClassDeclaration |
    ts.ClassExpression |
    FunctionLikeDeclaration |
    null;

export type ConstructWithParameters = FunctionLikeDeclaration |
    ts.SetAccessorDeclaration |
    ts.ConstructorDeclaration;
