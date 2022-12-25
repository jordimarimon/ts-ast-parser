import { createFunctionLike } from './create-function.js';
import { NodeFactory } from './node-factory.js';
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
    getLinePosition,
    getParameters,
    getTypeInfoFromTsType,
    getTypeParameters,
    isOptional,
    isReadOnly,
    SymbolWithContextType,
    tryAddNamespace,
    tryAddProperty,
} from '../utils/index.js';


export const interfaceFactory: NodeFactory<ts.InterfaceDeclaration> = {

    isNode: (node: ts.Node): node is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(node),

    create: createInterface,

};

function createInterface(node: ts.InterfaceDeclaration, moduleDoc: Module): void {
    const name = node.name?.getText() ?? '';
    const tmpl: InterfaceDeclaration = {
        name,
        line: getLinePosition(node),
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
    tryAddNamespace(node, tmpl);

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
    const params = callSignature ? getParameters(node, callSignature) : [];

    const tmpl: InterfaceField = {
        name: params?.[0]?.name ?? '',
        line: getLinePosition(node),
        kind: DeclarationKind.field,
        indexType: params?.[0]?.type ?? {text: ''},
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

    const jsDoc = getAllJSDoc(node);
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const hasReadOnlyTag = findJSDoc<boolean>(JSDocTagName.readonly, jsDoc)?.value;

    const tmpl: InterfaceField = {
        name: node.name?.getText() ?? '',
        line: getLinePosition(node),
        kind: DeclarationKind.field,
        type: jsDocDefinedType ? {text: jsDocDefinedType} : getTypeInfoFromTsType(type),
    };

    tryAddProperty(tmpl, 'readOnly', hasReadOnlyTag ?? isReadOnly(node));
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
        kind: DeclarationKind.method,
        ...createFunctionLike(node, type),
    };

    tryAddProperty(tmpl, 'inherited', inherited);

    return tmpl;
}
