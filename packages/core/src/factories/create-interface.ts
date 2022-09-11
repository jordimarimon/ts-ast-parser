import { createFunctionLike } from './create-function.js';
import { NodeFactory } from './node-factory.js';
import { Context } from '../context.js';
import ts from 'typescript';
import {
    ClassMember,
    ClassMethod,
    DeclarationKind,
    InterfaceDeclaration,
    InterfaceField,
    JSDocTagName,
    Module,
} from '../models/index.js';
import {
    findJSDoc,
    getAllJSDoc,
    getExtendClauseReferences,
    getTypeParameters,
    tryAddProperty,
} from '../utils/index.js';


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
        kind: DeclarationKind.interface,
    };
    const extendClauseRefs = getExtendClauseReferences(node);

    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(node));
    tryAddProperty(tmpl, 'jsDoc', getAllJSDoc(node));
    tryAddProperty(tmpl, 'members', getInterfaceMembers(node));
    tryAddProperty(tmpl, 'heritage', extendClauseRefs.map(e => e.reference));

    moduleDoc.declarations.push(tmpl);
}

function getInterfaceMembers(node: ts.InterfaceDeclaration): ClassMember[] {
    const result: ClassMember[] = [];
    const members = node.members ?? [];

    for (const member of members) {
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

    const tmpl: InterfaceField = {
        name: param.name?.getText() ?? '',
        indexType: {text: paramDefinedType ?? paramComputedType},
        kind: DeclarationKind.field,
        indexSignature: true,
        type: valueJSDocDefinedType
            ? {text: valueJSDocDefinedType}
            : {text: valueDefinedType ?? valueComputedType},
    };

    tryAddProperty(tmpl, 'optional', !!node.questionToken);
    tryAddProperty(tmpl, 'jsDoc', jsDoc);

    return tmpl;
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

    const tmpl: InterfaceField = {
        name: node.name?.getText() ?? '',
        kind: DeclarationKind.field,
        type: jsDocDefinedType
            ? {text: jsDocDefinedType}
            : {text: userDefinedType ?? computedType},
    };

    tryAddProperty(tmpl, 'optional', !!node.questionToken);
    tryAddProperty(tmpl, 'jsDoc', jsDoc);

    return tmpl;
}

function createInterfaceMethod(node: ts.MethodSignature | ts.PropertySignature): ClassMethod {
    return {
        ...createFunctionLike(node),
        kind: DeclarationKind.method,
    };
}
