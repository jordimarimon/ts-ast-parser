import { FunctionDeclaration, FunctionLike, JSDocTagType, Module, Parameter } from '../models';
import { Options } from '../options';
import { getJSDoc } from '../utils';
import ts from 'typescript';


export function createFunction(
    node: ts.VariableStatement | ts.FunctionDeclaration,
    moduleDoc: Module,
    options: Partial<Options> = {},
): void {
    const tmpl: FunctionDeclaration = {
        ...createFunctionLike(node, options),
        kind: 'function',
    };

    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === tmpl.name);

    if (alreadyExists) {
        return;
    }

    moduleDoc.declarations.push(tmpl);
}

export function createFunctionLike(
    node: ts.VariableStatement | ts.FunctionDeclaration | ts.MethodDeclaration | ts.PropertyDeclaration,
    options: Partial<Options> = {},
): FunctionLike {
    const jsDoc = getJSDoc(node, options.jsDocHandlers);
    const func = getFunctionNode(node);

    return {
        name: func?.name?.getText() || '',
        decorators: [],
        description: jsDoc[JSDocTagType.description] ?? '',
        jsDoc,
        return: {
            type: {text: getFunctionType(node)},
            description: jsDoc[JSDocTagType.returns] ?? '',
        },
        async: isAsyncFunction(node),
        parameters: getParameters(node),
    };
}

function isAsyncFunction(node: ts.Node): boolean {
    const func = getFunctionNode(node);

    return !!func?.modifiers?.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);
}

function getFunctionType(node: ts.Node): string {
    const func = getFunctionNode(node);

    return func?.type?.getText() || '';
}

function getParameters(node: ts.Node): Parameter[] {
    const func = getFunctionNode(node);
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
            jsDoc: {},
        };

        parameters.push(parameter);
    }

    return parameters;
}

function getFunctionNode(node: ts.Node): ts.FunctionDeclaration | ts.ArrowFunction | null {
    let func: ts.Node | undefined = node;

    if (ts.isVariableStatement(node)) {
        const isArrowFunction = (expr: ts.Expression | undefined): expr is ts.ArrowFunction => {
            return expr != null && ts.isArrowFunction(expr);
        };

        func = node.declarationList.declarations.find(decl => isArrowFunction(decl.initializer));
    }

    if (ts.isPropertyDeclaration(node)) {
        func = node.initializer;
    }

    if (func == null || (!ts.isFunctionDeclaration(func) && !ts.isArrowFunction(func))) {
        return null;
    }

    return func;
}
