import { FunctionDeclaration, FunctionLike, JSDocTagName, Module, Parameter } from '../models';
import { collectJSDoc, findJSDoc } from '../utils';
import ts from 'typescript';


export function createFunction(node: ts.VariableStatement | ts.FunctionDeclaration, moduleDoc: Module): void {
    const tmpl: FunctionDeclaration = {
        ...createFunctionLike(node),
        kind: 'function',
    };

    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === tmpl.name);

    if (alreadyExists) {
        return;
    }

    moduleDoc.declarations.push(tmpl);
}

export function createFunctionLike(node: ts.Node): FunctionLike {
    const jsDoc = collectJSDoc(node);
    const func = getFunctionNode(node);

    return {
        name: getFunctionName(node),
        decorators: [],
        description: findJSDoc<string>(JSDocTagName.description, jsDoc)?.value ?? '',
        jsDoc,
        return: {
            type: {text: getFunctionType(func)},
            description: findJSDoc<string>(JSDocTagName.returns, jsDoc)?.value ?? '',
        },
        async: isAsyncFunction(func),
        parameters: getParameters(func),
    };
}

function getFunctionName(node: ts.Node): string {
    if (ts.isFunctionDeclaration(node)) {
        return node?.name?.getText() || '';
    }

    if (ts.isVariableStatement(node)) {
        const decl = node.declarationList.declarations.find(d => isArrowFunction(d.initializer));

        return decl?.name?.getText() || '';
    }

    if (ts.isPropertyDeclaration(node) && node.initializer && ts.isArrowFunction(node.initializer)) {
         return node.name?.getText() || '';
    }

    return '';
}

function getFunctionType(func: ts.FunctionDeclaration | ts.ArrowFunction | null): string {
    return func?.type?.getText() || '';
}

function isAsyncFunction(func: ts.FunctionDeclaration | ts.ArrowFunction | null): boolean {
    return !!func?.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);
}

function isArrowFunction(expr: ts.Expression | undefined): expr is ts.ArrowFunction {
    return expr != null && ts.isArrowFunction(expr);
}

function getParameters(func: ts.FunctionDeclaration | ts.ArrowFunction | null): Parameter[] {
    const parameters: Parameter[] = [];
    const originalParameters = func?.parameters ?? [];

    for (const param of originalParameters) {
        const parameter: Parameter = {
            name: param.name.getText(),
            description: '',
            decorators: [],
            optional: !!param?.questionToken,
            default: param?.initializer?.getText() ?? '',
            type: {text: param?.type?.getText() ?? ''},
            rest: !!(param?.dotDotDotToken && param.type?.kind === ts.SyntaxKind.ArrayType),
            jsDoc: [],
        };

        parameters.push(parameter);
    }

    return parameters;
}

function getFunctionNode(node: ts.Node): ts.FunctionDeclaration | ts.ArrowFunction | null {
    let func: ts.Node | undefined = node;

    if (ts.isVariableStatement(node)) {
        func = node.declarationList.declarations.find(decl => isArrowFunction(decl.initializer))?.initializer;
    }

    if (ts.isPropertyDeclaration(node)) {
        func = node.initializer;
    }

    if (func == null || (!ts.isFunctionDeclaration(func) && !ts.isArrowFunction(func))) {
        return null;
    }

    return func;
}
