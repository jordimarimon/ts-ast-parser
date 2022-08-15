import { FunctionDeclaration, FunctionLike, Module, Parameter } from '../models/index.js';
import { getAllJSDoc, getTypeParameters } from '../utils/index.js';
import { Context } from '../context.js';
import ts from 'typescript';


type FunctionLikeDeclaration = ts.FunctionDeclaration |
    ts.ArrowFunction |
    ts.MethodSignature |
    ts.FunctionExpression |
    ts.FunctionTypeNode |
    null;

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

    return {
        name: getFunctionName(node),
        decorators: [],
        jsDoc,
        return: {type: {text: getFunctionReturnType(func)}},
        async: isAsyncFunction(func),
        parameters: getFunctionParameters(func),
        typeParameters: getTypeParameters(func),
    };
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

export function getFunctionParameters(func: FunctionLikeDeclaration): Parameter[] {
    const parameters: Parameter[] = [];
    const originalParameters = func?.parameters ?? [];
    const checker = Context.checker;

    for (const param of originalParameters) {
        // The computed type from the TypeScript TypeChecker (as a last resource)
        const computedType = checker?.typeToString(checker?.getTypeAtLocation(param), param) || '';
        const parameter: Parameter = {
            name: param.name.getText(),
            decorators: [],
            optional: !!param?.questionToken,
            default: param?.initializer?.getText() ?? '',
            type: {text: param?.type?.getText() ?? computedType},
            rest: !!(param?.dotDotDotToken && param.type?.kind === ts.SyntaxKind.ArrayType),
        };

        parameters.push(parameter);
    }

    return parameters;
}

function isAsyncFunction(func: FunctionLikeDeclaration): boolean {
    return !!func?.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);
}

function isArrowFunction(expr: ts.Expression | undefined): expr is ts.ArrowFunction {
    return expr != null && ts.isArrowFunction(expr);
}

function isFunctionExpression(expr: ts.Expression | undefined): expr is ts.FunctionExpression {
    return expr != null && ts.isFunctionExpression(expr);
}

function getFunctionName(node: ts.Node): string {
    if (ts.isFunctionDeclaration(node)) {
        return node?.name?.getText() || '';
    }

    if (ts.isVariableStatement(node)) {
        const declaration = node.declarationList.declarations.find(decl => {
            return isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer);
        });

        return declaration?.name?.getText() || '';
    }

    if (ts.isPropertyDeclaration(node) && node.initializer && ts.isArrowFunction(node.initializer)) {
        return node.name?.getText() || '';
    }

    return '';
}

function getFunctionNode(node: ts.Node): FunctionLikeDeclaration {
    let func: ts.Node | undefined = node;

    if (ts.isVariableStatement(node)) {
        const declaration = node.declarationList.declarations.find(decl => {
            return isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer);
        });

        func = declaration?.initializer;
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
            !ts.isFunctionTypeNode(func)
        )
    ) {
        return null;
    }

    return func;
}
