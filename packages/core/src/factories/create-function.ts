import { DeclarationKind, FunctionDeclaration, FunctionLike, FunctionSignature, Module } from '../models/index.js';
import { getDecorators } from '../utils/decorator.js';
import { NodeFactory } from './node-factory.js';
import { Context } from '../context.js';
import ts from 'typescript';
import {
    getAllJSDoc,
    getFunctionName,
    getFunctionNode,
    getLinePosition,
    getParameters,
    getSignatures,
    getTypeParameters,
    isAsyncFunction,
    isFunctionDeclaration,
    isGeneratorFunction,
    tryAddNamespace,
    tryAddProperty,
} from '../utils/index.js';


export const functionFactory: NodeFactory<ts.VariableStatement | ts.FunctionDeclaration> = {

    isNode: isFunctionDeclaration,

    create: createFunction,

};

function createFunction(node: ts.VariableStatement | ts.FunctionDeclaration, moduleDoc: Module): void {
    const tmpl: FunctionDeclaration = {
        kind: DeclarationKind.function,
        ...createFunctionLike(node),
    };

    tryAddNamespace(node, tmpl);

    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === tmpl.name);

    // Functions can be overloaded
    if (alreadyExists) {
        return;
    }

    moduleDoc.declarations.push(tmpl);
}

function createSignature(signature: ts.Signature): FunctionSignature {
    const checker = Context.checker;
    const returnTypeOfSignature = signature && checker?.getReturnTypeOfSignature(signature);
    const returnType = returnTypeOfSignature && checker?.typeToString(returnTypeOfSignature);
    const declaration = signature.getDeclaration();
    const jsDoc = getAllJSDoc(declaration);
    const tmpl: FunctionSignature = {
        line: getLinePosition(declaration),
        return: {
            type: {
                text: returnType ?? '',
            },
        },
    };

    tryAddProperty(tmpl, 'jsDoc', jsDoc);
    tryAddProperty(tmpl, 'parameters', getParameters(declaration, signature));
    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(declaration));

    return tmpl;
}

export function createFunctionLike(node: ts.Node, type?: ts.Type | undefined): FunctionLike {
    const func = getFunctionNode(node);
    const signatures = getSignatures(func, type);
    const tmpl: FunctionLike = {
        name: getFunctionName(node),
        signatures: signatures.map(s => createSignature(s)),
    };

    if (node !== func) {
        const jsDoc = getAllJSDoc(node);
        tryAddProperty(tmpl, 'jsDoc', jsDoc);
    }

    tryAddProperty(tmpl, 'decorators', getDecorators(node));

    if (!ts.isPropertySignature(node) && !ts.isMethodSignature(node)) {
        tryAddProperty(tmpl, 'async', isAsyncFunction(func));
    }

    if (func && (ts.isFunctionDeclaration(func) || ts.isFunctionExpression(func) || ts.isMethodDeclaration(func))) {
        tryAddProperty(tmpl, 'generator', isGeneratorFunction(func));
    }

    return tmpl;
}
