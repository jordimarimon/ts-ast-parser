import { FunctionLikeDeclaration, GeneratorFunction } from './types.js';
import { getSymbolAtLocation } from './symbol.js';
import { getModifiers } from './modifiers.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function isAsyncFunction(func: FunctionLikeDeclaration): boolean {
    if (!func) {
        return false;
    }

    return getModifiers(func).some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);
}

export function getReturnStatement(node: ts.Block | undefined): ts.ReturnStatement | undefined {
    return node?.statements.find(ts.isReturnStatement);
}

export function isArrowFunction(expr: ts.Expression | undefined): expr is ts.ArrowFunction {
    return expr != null && ts.isArrowFunction(expr);
}

export function isFunctionExpression(expr: ts.Expression | undefined): expr is ts.FunctionExpression {
    return expr != null && ts.isFunctionExpression(expr);
}

export function isGeneratorFunction(func: GeneratorFunction | undefined): boolean {
    return !!func?.asteriskToken;
}

export function getSignatures(node: FunctionLikeDeclaration, type?: ts.Type | undefined): readonly ts.Signature[] {
    const checker = Context.checker;

    let funcType: ts.Type | null | undefined = type;

    if (!funcType) {
        const symbol = node && getSymbolAtLocation(node);
        funcType = node && symbol && checker?.getTypeOfSymbolAtLocation(symbol, node.getSourceFile());
    }

    // Anonymous functions
    if (!funcType) {
        const signature = node && checker?.getSignatureFromDeclaration(node);
        return signature ? [signature] : [];
    }

    // FIXME(Jordi M.): It doesn't return the signature that has the implementation
    //  of the method/function body when there is overloading.
    //  We could do something like:
    //          symbol.getDeclarations().map(d => checker.getSignatureFromDeclaration(d))
    //  but this won't work for methods in classes or interfaces as we need the context
    //  of the implementation (type parameters resolved).
    return funcType.getNonNullableType().getCallSignatures();
}

export function isFunctionDeclaration(node: ts.Node): node is ts.FunctionDeclaration | ts.VariableStatement {
    if (node == null) {
        return false;
    }

    // Case of:
    //
    //      function name(...) { ... }
    //
    if (ts.isFunctionDeclaration(node)) {
        return true;
    }

    // If it's not a function declaration, we only care about case like:
    //
    //      const name = (...) => { ... };
    //

    if (!ts.isVariableStatement(node)) {
        return false;
    }

    const declaration = node.declarationList?.declarations?.[0];

    if (!declaration) {
        return false;
    }

    const initializer = declaration.initializer;

    return !!initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
}

export function getFunctionName(node: ts.Node): string {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
        return node?.name?.getText() || '';
    }

    if (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) {
        return node.name?.getText() || '';
    }

    if (ts.isVariableStatement(node)) {
        const declaration = node.declarationList.declarations.find(decl => {
            return isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer);
        });

        return declaration?.name?.getText() || '';
    }

    return '';
}

export function getFunctionNode(node: ts.Node): FunctionLikeDeclaration {
    let func: ts.Node | undefined | null = node;

    if (ts.isVariableStatement(node)) {
        const declaration = node.declarationList.declarations.find(decl => {
            return isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer);
        });

        func = declaration?.initializer;
    }

    if (ts.isPropertySignature(node)) {
        func = node.type?.kind === ts.SyntaxKind.FunctionType ? node.type as ts.FunctionTypeNode : null;
    }

    if (ts.isPropertyDeclaration(node)) {
        func = node.initializer;
    }

    if (
        func == null ||
        (
            !ts.isFunctionDeclaration(func) &&
            !ts.isArrowFunction(func) &&
            !ts.isFunctionExpression(func) &&
            !ts.isMethodSignature(func) &&
            !ts.isMethodDeclaration(func) &&
            !ts.isFunctionTypeNode(func)
        )
    ) {
        return null;
    }

    return func;
}
