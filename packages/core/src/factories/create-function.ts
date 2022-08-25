import { FunctionLikeDeclaration, getAllJSDoc, getParameters, getTypeParameters } from '../utils/index.js';
import { FunctionDeclaration, FunctionLike, Module } from '../models/index.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function createFunction(node: ts.VariableStatement | ts.FunctionDeclaration, moduleDoc: Module): void {
    const tmpl: FunctionDeclaration = {
        kind: 'function',
        ...createFunctionLike(node),
    };

    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === tmpl.name);

    if (alreadyExists) {
        return;
    }

    moduleDoc.declarations.push(tmpl);
}

export function createFunctionLike(node: ts.Node): FunctionLike {
    const jsDoc = getAllJSDoc(node);
    const func = getFunctionNode(node);

    const tmpl: FunctionLike = {
        name: getFunctionName(node),
        decorators: [],
        jsDoc,
        return: {type: {text: getFunctionReturnType(func)}},
        parameters: getParameters(func),
        typeParameters: getTypeParameters(func),
    };

    if (!ts.isPropertySignature(node) && !ts.isMethodSignature(node)) {
        tmpl.async = isAsyncFunction(func);
    }

    return tmpl;
}

export function getFunctionReturnType(func: FunctionLikeDeclaration): string {
    const definedType = func?.type?.getText() || '';

    if (definedType !== '') {
        return definedType;
    }

    const checker = Context.checker;
    const signature = func && checker?.getSignatureFromDeclaration(func);
    const returnTypeOfSignature = signature && checker?.getReturnTypeOfSignature(signature);
    const computedType = returnTypeOfSignature && checker?.typeToString(returnTypeOfSignature);

    return computedType || '';
}

export function isAsyncFunction(func: FunctionLikeDeclaration): boolean {
    return !!func?.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);
}

export function isArrowFunction(expr: ts.Expression | undefined): expr is ts.ArrowFunction {
    return expr != null && ts.isArrowFunction(expr);
}

export function isFunctionExpression(expr: ts.Expression | undefined): expr is ts.FunctionExpression {
    return expr != null && ts.isFunctionExpression(expr);
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
