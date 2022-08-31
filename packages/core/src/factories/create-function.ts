import { FunctionDeclaration, FunctionLike, Module } from '../models/index.js';
import { getDecorators } from '../utils/decorator.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';
import {
    getAllJSDoc,
    getFunctionName,
    getFunctionNode,
    getFunctionReturnType,
    getParameters,
    getTypeParameters,
    isAsyncFunction,
    isFunctionDeclaration,
    isGeneratorFunction,
} from '../utils/index.js';
import { tryAddProperty } from '../utils/try-add-property.js';


export const functionFactory: NodeFactory<ts.VariableStatement | ts.FunctionDeclaration> = {

    isNode: isFunctionDeclaration,

    create: createFunction,

};

function createFunction(node: ts.VariableStatement | ts.FunctionDeclaration, moduleDoc: Module): void {
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
        return: {
            type: {
                text: getFunctionReturnType(func),
            },
        },
    };

    tryAddProperty(tmpl, 'decorators', getDecorators(node));
    tryAddProperty(tmpl, 'jsDoc', jsDoc);
    tryAddProperty(tmpl, 'parameters', getParameters(func));
    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(func));

    if (!ts.isPropertySignature(node) && !ts.isMethodSignature(node)) {
        tryAddProperty(tmpl, 'async', isAsyncFunction(func));
    }

    if (func && (ts.isFunctionDeclaration(func) || ts.isFunctionExpression(func) || ts.isMethodDeclaration(func))) {
        tryAddProperty(tmpl, 'generator', isGeneratorFunction(func));
    }

    return tmpl;
}
