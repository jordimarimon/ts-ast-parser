import { GeneratorFunction, FunctionLikeDeclaration } from './types.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function isAsyncFunction(func: FunctionLikeDeclaration): boolean {
    if (!func) {
        return false;
    }

    const modifiers = ts.canHaveModifiers(func) ? (ts.getModifiers(func) ?? []) : [];

    return modifiers.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);
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

export function getFunctionReturnTypeFromFunctionType(type: ts.Type): string {
    const checker = Context.checker;
    const callSignature = type.getCallSignatures()?.[0];

    return callSignature ? (checker?.typeToString(callSignature.getReturnType()) ?? '') : '';
}

export function getFunctionReturnTypeFromDeclaration(func: FunctionLikeDeclaration): string {
    if (!func) {
        return '';
    }

    const definedType = func.type?.getText() || '';

    if (definedType !== '') {
        return definedType;
    }

    const checker = Context.checker;
    const signature = checker?.getSignatureFromDeclaration(func);
    const returnTypeOfSignature = signature && checker?.getReturnTypeOfSignature(signature);
    const computedType = returnTypeOfSignature && checker?.typeToString(returnTypeOfSignature);

    return computedType || '';
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
