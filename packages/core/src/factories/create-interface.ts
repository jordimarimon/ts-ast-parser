import { findJSDoc, getAllJSDoc, getTypeParameters } from '../utils/index.js';
import { createFunctionLike } from './create-function.js';
import { NodeFactory } from './node-factory.js';
import { Context } from '../context.js';
import ts from 'typescript';
import {
    ClassMember,
    ClassMethod,
    InterfaceDeclaration,
    InterfaceField,
    JSDocTagName,
    Module,
} from '../models/index.js';


export const interfaceFactory: NodeFactory<ts.InterfaceDeclaration> = {

    isNode: (node: ts.Node): node is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(node),

    create: createInterface,

};

function createInterface(node: ts.InterfaceDeclaration, moduleDoc: Module): void {
    const name = node.name?.getText() ?? '';
    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

    if (alreadyExists) {
        return;
    }

    const tmpl: InterfaceDeclaration = {
        name,
        kind: 'interface',
        typeParameters: getTypeParameters(node),
        jsDoc: getAllJSDoc(node),
        members: getInterfaceMembers(node),
    };

    moduleDoc.declarations.push(tmpl);
}

function getInterfaceMembers(node: ts.InterfaceDeclaration): ClassMember[] {
    const result: ClassMember[] = [];

    for (const member of (node.members ?? [])) {
        if (ts.isPropertySignature(member)) {
            result.push(createInterfaceFieldFromPropertySignature(member));
        }

        if (ts.isMethodSignature(member)) {
            result.push(createInterfaceMethod(member));
        }

        if (ts.isIndexSignatureDeclaration(member)) {
            result.push(createInterfaceFieldFromIndexSignature(member));
        }
    }

    return result;
}

function createInterfaceFieldFromIndexSignature(node: ts.IndexSignatureDeclaration): InterfaceField {
    const checker = Context.checker;
    const jsDoc = getAllJSDoc(node);

    const valueJSDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const valueDefinedType = node.type?.getText();
    const valueComputedType = checker?.typeToString(checker?.getTypeAtLocation(node), node) || '';

    const param = node.parameters?.[0];
    const paramDefinedType = param?.type?.getText();
    const paramComputedType = checker?.typeToString(checker?.getTypeAtLocation(param), param) || '';

    return {
        name: param.name?.getText() ?? '',
        indexType: {text: paramDefinedType ?? paramComputedType},
        kind: 'field',
        indexSignature: true,
        optional: !!node.questionToken,
        type: valueJSDocDefinedType
            ? {text: valueJSDocDefinedType}
            : {text: valueDefinedType ?? valueComputedType},
        jsDoc,
    };
}

function createInterfaceFieldFromPropertySignature(node: ts.PropertySignature): ClassMember {
    if (node.type?.kind === ts.SyntaxKind.FunctionType) {
        return createInterfaceMethod(node);
    }

    const checker = Context.checker;
    const jsDoc = getAllJSDoc(node);

    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const userDefinedType = node.type?.getText();
    const computedType = checker?.typeToString(checker?.getTypeAtLocation(node), node) || '';

    return {
        name: node.name?.getText() ?? '',
        kind: 'field',
        optional: !!node.questionToken,
        type: jsDocDefinedType
            ? {text: jsDocDefinedType}
            : {text: userDefinedType ?? computedType},
        jsDoc,
    };
}

function createInterfaceMethod(node: ts.MethodSignature | ts.PropertySignature): ClassMethod {
    return {
        ...createFunctionLike(node),
        kind: 'method',
    };
}
