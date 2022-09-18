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
    getInheritedSymbol,
    getSymbolAtLocation,
    getType,
    getTypeParameters,
    InheritedSymbol,
    isOptional, isReadOnly,
    NodeWithType,
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

    const parentInterface = getInheritedSymbol(node);
    const extendClauseRefs = getExtendClauseReferences(node);
    const resolvedParentInterfaceName = extendClauseRefs[0]?.reference?.name ?? '';
    const nodeMembers = Array.from(node.members).map(m => ({
        node: m,
        symbol: getSymbolAtLocation(m),
        type: getType(m),
    }));
    const interfaceMembers = getInterfaceMembers(nodeMembers);
    const inheritedMembers = getInheritedMembers(parentInterface, resolvedParentInterfaceName, interfaceMembers);

    tryAddProperty(tmpl, 'heritage', extendClauseRefs.map(e => e.reference));
    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(node));
    tryAddProperty(tmpl, 'jsDoc', getAllJSDoc(node));
    tryAddProperty(tmpl, 'members', [...inheritedMembers, ...interfaceMembers]);

    moduleDoc.declarations.push(tmpl);
}

function getInheritedMembers(
    parentInterface: InheritedSymbol | null,
    parentName: string,
    childMembers: ClassMember[],
): ClassMember[] {
    if (!parentInterface) {
        return [];
    }

    const nonOverrideNodes: NodeWithType[] = [];

    for (const prop of parentInterface.properties) {
        const symbol = prop.symbol;
        const propName = symbol.getName();

        // Ignore override members
        if (childMembers.some(childMember => childMember.name === propName)) {
            continue;
        }

        const d = symbol.getDeclarations()?.[0];

        if (!d) {
            continue;
        }

        nonOverrideNodes.push({symbol, node: d, type: prop.type});
    }

    const inheritedMembers = getInterfaceMembers(nonOverrideNodes);

    for (const inheritedMember of inheritedMembers) {
        inheritedMember.inheritedFrom = parentName;
    }

    return inheritedMembers;
}

function getInterfaceMembers(members: NodeWithType[]): ClassMember[] {
    const result: ClassMember[] = [];

    for (const member of members) {
        const {node, type, symbol} = member;

        if (ts.isPropertySignature(node)) {
            result.push(createInterfaceFieldFromPropertySignature({node, type, symbol}));
        }

        if (ts.isMethodSignature(node)) {
            result.push(createInterfaceMethod({node, type, symbol}));
        }

        if (ts.isIndexSignatureDeclaration(node)) {
            result.push(createInterfaceFieldFromIndexSignature({node, type, symbol}));
        }
    }

    return result;
}

function createInterfaceFieldFromIndexSignature(member: NodeWithType<ts.IndexSignatureDeclaration>): InterfaceField {
    const checker = Context.checker;
    const {node, type} = member;
    const jsDoc = getAllJSDoc(node);

    const valueJSDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const valueDefinedType = node.type?.getText();
    const valueComputedType = (type && checker?.typeToString(type)) || '';

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

function createInterfaceFieldFromPropertySignature(member: NodeWithType<ts.PropertySignature>): ClassMember {
    const {node, type, symbol} = member;

    if (node.type?.kind === ts.SyntaxKind.FunctionType) {
        return createInterfaceMethod(member);
    }

    const checker = Context.checker;
    const jsDoc = getAllJSDoc(node);

    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const computedType = (type && checker?.typeToString(type)) || '';

    const tmpl: InterfaceField = {
        name: node.name?.getText() ?? '',
        kind: DeclarationKind.field,
        type: jsDocDefinedType ? {text: jsDocDefinedType} : {text: computedType},
    };

    tryAddProperty(tmpl, 'readOnly', isReadOnly(symbol, node));
    tryAddProperty(tmpl, 'optional', isOptional(symbol));
    tryAddProperty(tmpl, 'jsDoc', jsDoc);

    return tmpl;
}

function createInterfaceMethod(member: NodeWithType<ts.MethodSignature | ts.PropertySignature>): ClassMethod {
    const {node, type} = member;

    return {
        ...createFunctionLike(node, type),
        kind: DeclarationKind.method,
    };
}
