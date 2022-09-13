import ts from 'typescript';


export type FunctionLikeDeclaration = ts.FunctionDeclaration |
    ts.ArrowFunction |
    ts.MethodSignature |
    ts.FunctionExpression |
    ts.FunctionTypeNode |
    ts.MethodDeclaration |
    null;

export type GeneratorFunction = ts.FunctionDeclaration | ts.FunctionExpression | ts.MethodDeclaration;

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

export type NodeWithType<T = ts.Node> = {node: T; type: ts.Type | undefined};

export type SymbolWithType = {symbol: ts.Symbol; type: ts.Type | undefined};