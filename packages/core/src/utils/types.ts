import ts from 'typescript';


export type FunctionLikeDeclaration = ts.FunctionDeclaration |
    ts.ArrowFunction |
    ts.MethodSignature |
    ts.FunctionExpression |
    ts.FunctionTypeNode |
    ts.MethodDeclaration |
    null;

export type GeneratorFunction = ts.FunctionDeclaration | ts.FunctionExpression | ts.MethodDeclaration;

export type InterfaceOrClassDeclaration = ts.ClassDeclaration | ts.ClassExpression | ts.InterfaceDeclaration;

export type NodeWithTypeParameter = ts.TypeAliasDeclaration |
    ts.InterfaceDeclaration |
    ts.ClassDeclaration |
    ts.ClassExpression |
    ts.SignatureDeclaration |
    FunctionLikeDeclaration |
    null;

export type NodeWithParameters = FunctionLikeDeclaration |
    ts.SetAccessorDeclaration |
    ts.SignatureDeclaration |
    ts.ConstructorDeclaration;

export type NodeWithHeritageClause = ts.InterfaceDeclaration | ts.ClassDeclaration | ts.ClassExpression;

export type SymbolWithLocation = {
    path: string;
    line: number | null;
    symbol: ts.Symbol | undefined;
};

export type SymbolWithContextType = {
    symbol: ts.Symbol | undefined;
    type: ts.Type | undefined;
    overrides?: boolean;
    inherited?: boolean;
};
