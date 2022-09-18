import { createFunctionLike } from './create-function.js';
import { getDecorators } from '../utils/decorator.js';
import { NodeFactory } from './node-factory.js';
import { Context } from '../context.js';
import ts from 'typescript';
import {
    ClassDeclaration,
    ClassField,
    ClassMember,
    ClassMethod,
    Constructor,
    DeclarationKind,
    JSDocTagName,
    Module,
} from '../models/index.js';
import {
    findJSDoc,
    getAllJSDoc,
    getConstructors,
    getExtendClauseReferences,
    getInstanceProperties,
    getParameters,
    getReturnStatement,
    getStaticProperties,
    getTypeParameters,
    getVisibilityModifier,
    isAbstract,
    isArrowFunction,
    isFunctionExpression,
    isOptional,
    isReadOnly,
    isStaticMember,
    resolveExpression,
    SymbolWithContextType,
    tryAddProperty,
} from '../utils/index.js';


type NodeType = ts.ClassDeclaration | ts.ClassExpression;

export const classFactory: NodeFactory<NodeType> = {

    isNode: isClassNode,

    create: createClass,

};

function isClassNode(node: ts.Node): node is NodeType {
    return ts.isClassDeclaration(node) || ts.isClassExpression(node);
}

function createClass(node: NodeType, moduleDoc: Module): void {
    const name = node.name?.getText() ?? '';
    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

    if (alreadyExists) {
        return;
    }

    const tmpl: ClassDeclaration = {kind: DeclarationKind.class, name};
    const instanceProperties = getInstanceProperties(node);
    const staticProperties = getStaticProperties(node);
    const extendClauseRefs = getExtendClauseReferences(node);
    const constructors = getConstructors(node);
    const members = [
        ...getMembers(staticProperties),
        ...getMembers(instanceProperties),
    ];

    tryAddProperty(tmpl, 'constructors', createConstructors(constructors));
    tryAddProperty(tmpl, 'decorators', getDecorators(node));
    tryAddProperty(tmpl, 'jsDoc', getAllJSDoc(node));
    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(node));
    tryAddProperty(tmpl, 'heritage', extendClauseRefs.map(e => e.reference));
    tryAddProperty(tmpl, 'abstract', isAbstract(node));
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
    const isProperty = ts.isPropertyDeclaration(decl);
    const isPropertyMethod = isProperty &&
        (isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer));

    if (ts.isMethodDeclaration(decl) || isPropertyMethod) {
        result.push(createMethod(decl, member));
        return;
    }

    if (isProperty) {
        result.push(createFieldFromProperty(decl, member));
        return;
    }

    if (ts.isGetAccessor(decl) || ts.isSetAccessor(decl)) {
        result.push(createFieldFromPropertyAccessor(member));
    }
}

function createMethod(
    node: ts.MethodDeclaration | ts.PropertyDeclaration,
    member: SymbolWithContextType,
): ClassMethod {
    const {symbol, type, inherited, overrides} = member;
    const tmpl: ClassMethod = {
        kind: DeclarationKind.method,
        ...createFunctionLike(node, type),
    };

    tryAddProperty(tmpl, 'static', isStaticMember(node));
    tryAddProperty(tmpl, 'modifier', getVisibilityModifier(node));
    tryAddProperty(tmpl, 'readOnly', isReadOnly(symbol, node));
    tryAddProperty(tmpl, 'abstract', isAbstract(node));
    tryAddProperty(tmpl, 'override', overrides);
    tryAddProperty(tmpl, 'inherited', !overrides && inherited);

    return tmpl;
}

function createFieldFromProperty(node: ts.PropertyDeclaration, member: SymbolWithContextType): ClassField {
    const {inherited, type, symbol, overrides} = member;
    const checker = Context.checker;
    const jsDoc = getAllJSDoc(node);
    const name = node.name?.getText() ?? '';
    const defaultValue = findJSDoc<string>(JSDocTagName.default, jsDoc)?.value;
    const computedType = type ? (checker?.typeToString(type) ?? '') : '';
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const hasReadOnlyTag = findJSDoc<boolean>(JSDocTagName.readonly, jsDoc)?.value;

    const tmpl: ClassField = {
        kind: DeclarationKind.field,
        name,
        modifier: getVisibilityModifier(node),
        type: jsDocDefinedType ? {text: jsDocDefinedType} : {text: computedType},
    };

    tryAddProperty(tmpl, 'static', isStaticMember(node));
    tryAddProperty(tmpl, 'optional', isOptional(symbol));
    tryAddProperty(tmpl, 'jsDoc', jsDoc);
    tryAddProperty(tmpl, 'decorators', getDecorators(node));
    tryAddProperty(tmpl, 'default', defaultValue ?? resolveExpression(node.initializer));
    tryAddProperty(tmpl, 'readOnly', hasReadOnlyTag ?? isReadOnly(symbol, node));
    tryAddProperty(tmpl, 'abstract', isAbstract(node));
    tryAddProperty(tmpl, 'override', overrides);
    tryAddProperty(tmpl, 'inherited', !overrides && inherited);

    return tmpl;
}

function createConstructors(signatures: readonly ts.Signature[]): Constructor[] {
    const result: Constructor[] = [];

    for (const sign of signatures) {
        const ctor: Constructor = {};
        const decl = sign.getDeclaration();

        if (!decl) {
            continue;
        }

        tryAddProperty(ctor, 'jsDoc', getAllJSDoc(decl));
        tryAddProperty(ctor, 'parameters', getParameters(decl, sign));

        if (Object.keys(ctor).length) {
            result.push(ctor);
        }
    }

    return result;
}

function createFieldFromPropertyAccessor(member: SymbolWithContextType): ClassMember {
    const checker = Context.checker;
    const {symbol, type, inherited, overrides} = member;
    const decls = symbol?.getDeclarations() ?? [];
    const getter = decls.find(ts.isGetAccessor);
    const hasSetter = decls.some(ts.isSetAccessor);

    if (getter != null) {
        const name = getter.name?.getText();
        const jsDoc = getAllJSDoc(getter);
        const hasReadOnlyTag = findJSDoc<boolean>(JSDocTagName.readonly, jsDoc)?.value;
        const returnStatement = getReturnStatement(getter.body);
        const returnValue = resolveExpression(returnStatement?.expression);
        const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
        const computedType = type ? (checker?.typeToString(type) ?? '') : '';

        const tmpl: ClassField = {
            kind: DeclarationKind.field,
            name,
            type: jsDocDefinedType ? {text: jsDocDefinedType} : {text: computedType},
        };

        tryAddProperty(tmpl, 'jsDoc', jsDoc);
        tryAddProperty(tmpl, 'decorators', getDecorators(getter));
        tryAddProperty(tmpl, 'static', isStaticMember(getter));
        tryAddProperty(tmpl, 'override', overrides);
        tryAddProperty(tmpl, 'modifier', getVisibilityModifier(getter));
        tryAddProperty(tmpl, 'readOnly', hasReadOnlyTag ?? (isReadOnly(symbol, getter) || !hasSetter));
        tryAddProperty(tmpl, 'default', returnValue);
        tryAddProperty(tmpl, 'inherited', !overrides && inherited);

        return tmpl;
    }

    // We can assume it exists because this function is only called when there
    // is a property accessor defined and if the GetAccessor is not defined,
    // it must be the SetAccessor.
    const setter = decls.find(ts.isSetAccessor) as ts.SetAccessorDeclaration;
    const name = setter.name?.getText() ?? '';
    const jsDoc = getAllJSDoc(setter);
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const computedType = type ? (checker?.typeToString(type) ?? '') : '';

    const tmpl: ClassField = {
        kind: DeclarationKind.field,
        name,
        type: jsDocDefinedType ? {text: jsDocDefinedType} : {text: computedType},
        writeOnly: true,
    };

    tryAddProperty(tmpl, 'jsDoc', jsDoc);
    tryAddProperty(tmpl, 'static', isStaticMember(setter));
    tryAddProperty(tmpl, 'override', overrides);
    tryAddProperty(tmpl, 'modifier', getVisibilityModifier(setter));
    tryAddProperty(tmpl, 'decorators', getDecorators(setter));
    tryAddProperty(tmpl, 'inherited', !overrides && inherited);

    return tmpl;
}
