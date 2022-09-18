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
    getInstanceProperties,
    getExtendClauseReferences,
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

    const extendClauseRefs = getExtendClauseReferences(node);
    const interfaceMembers = getInstanceProperties(node);
    const members = getMembers(interfaceMembers);

    tryAddProperty(tmpl, 'heritage', extendClauseRefs.map(e => e.reference));
    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(node));
    tryAddProperty(tmpl, 'jsDoc', getAllJSDoc(node));
    tryAddProperty(tmpl, 'members', members);

    moduleDoc.declarations.push(tmpl);
}

function getMembers(members: SymbolWithContextType[]): ClassMember[] {
    const result: ClassMember[] = [];

    for (const member of members) {
        const {symbol} = member;
        const decl = symbol?.getDeclarations()?.[0];

        if (!decl) {
            continue;
        }

        tryAddDecl(decl, member, result);
    }

    return result;
}

function tryAddDecl(decl: ts.Declaration, member: SymbolWithContextType, result: ClassMember[]): void {
    if (ts.isPropertySignature(decl)) {
        result.push(createInterfaceFieldFromPropertySignature(decl, member));
    }

    if (ts.isMethodSignature(decl)) {
        result.push(createInterfaceMethod(decl, member));
    }

    if (ts.isIndexSignatureDeclaration(decl)) {
        result.push(createInterfaceFieldFromIndexSignature(decl, member));
    }
}

function createInterfaceFieldFromIndexSignature(
    node: ts.IndexSignatureDeclaration,
    member: SymbolWithContextType,
): InterfaceField {
    const checker = Context.checker;
    const {type, inherited} = member;
    const jsDoc = getAllJSDoc(node);

    const valueJSDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const valueComputedType = (type && checker?.typeToString(type)) || '';

    const param = node.parameters?.[0];
    const paramComputedType = checker?.typeToString(checker?.getTypeAtLocation(param), param) || '';

    const tmpl: InterfaceField = {
        name: param.name?.getText() ?? '',
        indexType: {text: paramComputedType},
        kind: DeclarationKind.field,
        indexSignature: true,
        type: valueJSDocDefinedType ? {text: valueJSDocDefinedType} : {text: valueComputedType},
    };

    tryAddProperty(tmpl, 'optional', !!node.questionToken);
    tryAddProperty(tmpl, 'inherited', inherited);
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
