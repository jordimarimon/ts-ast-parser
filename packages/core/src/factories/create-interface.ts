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
    getIndexSignature,
    getInstanceProperties,
    getParameters,
    getTypeParameters,
    isOptional,
    isReadOnly,
    SymbolWithContextType,
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

    const interfaceMembers = getInstanceProperties(node);
    const members = getMembers(interfaceMembers);
    const indexSignatureDecl = getIndexSignature(node);

    if (indexSignatureDecl) {
        members.push(createInterfaceFieldFromIndexSignature(indexSignatureDecl));
    }

    tryAddProperty(tmpl, 'heritage', getExtendClauseReferences(node));
    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(node));
    tryAddProperty(tmpl, 'jsDoc', getAllJSDoc(node));
    tryAddProperty(tmpl, 'members', members);

    moduleDoc.declarations.push(tmpl);
}

function getMembers(members: SymbolWithContextType[]): ClassMember[] {
    const result: ClassMember[] = [];

    for (const member of members) {
        tryAddDecl(member, result);
    }

    return result;
}

function tryAddDecl(member: SymbolWithContextType, result: ClassMember[]): void {
    const {symbol} = member;
    const decl = symbol?.getDeclarations()?.[0];

    if (!decl) {
        return;
    }

    if (ts.isPropertySignature(decl)) {
        result.push(createInterfaceFieldFromPropertySignature(decl, member));
    }

    if (ts.isMethodSignature(decl)) {
        result.push(createInterfaceMethod(decl, member));
    }
}

function createInterfaceFieldFromIndexSignature(member: SymbolWithContextType): InterfaceField {
    const {symbol, type} = member;
    const node = symbol?.getDeclarations()?.[0] as ts.IndexSignatureDeclaration;
    const jsDoc = getAllJSDoc(node);

    const valueJSDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const nodeType = node.type?.getText() ?? '';

    const callSignature = type?.getCallSignatures()?.[0];
    const param = getParameters(node, callSignature)[0];

    const tmpl: InterfaceField = {
        name: param?.name ?? '',
        indexType: param?.type ?? {text: ''},
        kind: DeclarationKind.field,
        indexSignature: true,
        type: {text: valueJSDocDefinedType || nodeType},
    };

    tryAddProperty(tmpl, 'optional', !!node.questionToken);
    tryAddProperty(tmpl, 'inherited', false);
    tryAddProperty(tmpl, 'jsDoc', jsDoc);

    return tmpl;
}

function createInterfaceFieldFromPropertySignature(
    node: ts.PropertySignature,
    member: SymbolWithContextType,
): ClassMember {
    const {type, symbol, inherited} = member;

    if (node.type?.kind === ts.SyntaxKind.FunctionType) {
        return createInterfaceMethod(node, member);
    }

    const checker = Context.checker;
    const jsDoc = getAllJSDoc(node);

    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const computedType = (type && checker?.typeToString(type)) || '';
    const hasReadOnlyTag = findJSDoc<boolean>(JSDocTagName.readonly, jsDoc)?.value;

    const tmpl: InterfaceField = {
        name: node.name?.getText() ?? '',
        kind: DeclarationKind.field,
        type: jsDocDefinedType ? {text: jsDocDefinedType} : {text: computedType},
    };

    tryAddProperty(tmpl, 'readOnly', hasReadOnlyTag ?? isReadOnly(symbol, node));
    tryAddProperty(tmpl, 'optional', isOptional(symbol));
    tryAddProperty(tmpl, 'inherited', inherited);
    tryAddProperty(tmpl, 'jsDoc', jsDoc);

    return tmpl;
}

function createInterfaceMethod(
    node: ts.MethodSignature | ts.PropertySignature,
    member: SymbolWithContextType,
): ClassMethod {
    const {type, inherited} = member;

    const tmpl: ClassMethod = {
        ...createFunctionLike(node, type),
        kind: DeclarationKind.method,
    };

    tryAddProperty(tmpl, 'inherited', inherited);

    return tmpl;
}
