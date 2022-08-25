import { ClassMember, ClassMethod, InterfaceDeclaration, JSDocTagName, Module } from '../models/index.js';
import { findJSDoc, getAllJSDoc, getTypeParameters } from '../utils/index.js';
import { createFunctionLike } from './create-function.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function createInterface(node: ts.InterfaceDeclaration, moduleDoc: Module): void {
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
        decorators: [],
        members: getInterfaceMembers(node),
    };

    moduleDoc.declarations.push(tmpl);
}

function getInterfaceMembers(node: ts.InterfaceDeclaration): ClassMember[] {
    const result: ClassMember[] = [];

    for (const member of (node.members ?? [])) {
        if (ts.isPropertySignature(member)) {
            result.push(createInterfaceField(member));
        }

        if (ts.isMethodSignature(member)) {
            result.push(createInterfaceMethod(member));
        }
    }

    return result;
}

function createInterfaceField(node: ts.PropertySignature): ClassMember {
    if (node.type?.kind === ts.SyntaxKind.FunctionType) {
        return createInterfaceMethod(node);
    }

    const checker = Context.checker;
    const jsDoc = getAllJSDoc(node);

    // If user specifies the type in the JSDoc -> we take it
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;

    // If user specifies the type in the declaration (`x: string`)
    const userDefinedType = node.type?.getText();

    // The computed type from the TypeScript TypeChecker (as a last resource)
    const computedType = checker?.typeToString(checker?.getTypeAtLocation(node), node) || '';

    return {
        name: node.name?.getText() ?? '',
        kind: 'field',
        optional: !!node.questionToken,
        type: jsDocDefinedType
            ? {text: jsDocDefinedType}
            : {text: userDefinedType ?? computedType},
        jsDoc,
        decorators: [],
    };
}

function createInterfaceMethod(node: ts.MethodSignature | ts.PropertySignature): ClassMethod {
    return {
        ...createFunctionLike(node),
        kind: 'method',
    };
}
