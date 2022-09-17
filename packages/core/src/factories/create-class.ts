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
    getExtendClauseReferences,
    getInheritedSymbol,
    getParameters,
    getReturnStatement,
    getType,
    getTypeParameters,
    getVisibilityModifier,
    InheritedSymbol,
    isAbstract,
    isArrowFunction,
    isFunctionExpression,
    isInheritedMember,
    isOverride,
    isReadOnly,
    isStaticMember,
    NodeWithType,
    resolveExpression,
    tryAddProperty,
} from '../utils/index.js';


type PropertyAccessor = { getter?: ts.GetAccessorDeclaration; setter?: ts.SetAccessorDeclaration };

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

    const ctorDecl = node.members.find((member): member is ts.ConstructorDeclaration => {
        return ts.isConstructorDeclaration(member);
    });

    const tmpl: ClassDeclaration = {kind: DeclarationKind.class, name};
    const parentClass = getInheritedSymbol(node);
    const classMembers = Array.from(node.members).map(m => ({node: m, type: getType(m)}));
    const extendClauseRefs = getExtendClauseReferences(node);
    const resolvedParentClassName = extendClauseRefs[0]?.reference?.name ?? '';

    let resultMembers = [
        ...getClassMembersFromPropertiesAndMethods(classMembers, parentClass),
        ...getClassMembersFromPropertyAccessors(classMembers, parentClass),
    ];
    resultMembers = [
        ...getInheritedMembers(parentClass, resolvedParentClassName, resultMembers),
        ...resultMembers,
    ];

    tryAddProperty(tmpl, 'decorators', getDecorators(node));
    tryAddProperty(tmpl, 'jsDoc', getAllJSDoc(node));
    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(node));
    tryAddProperty(tmpl, 'heritage', extendClauseRefs.map(e => e.reference));
    tryAddProperty(tmpl, 'abstract', isAbstract(node));
    tryAddProperty(tmpl, 'members', resultMembers);

    if (ctorDecl !== undefined) {
        tryAddProperty(tmpl, 'ctor', createConstructor(ctorDecl));
        resolveDefaultValueFromConstructor(tmpl, ctorDecl);
    }

    moduleDoc.declarations.push(tmpl);
}

function getInheritedMembers(
    parentClass: InheritedSymbol | null,
    parentName: string,
    childMembers: ClassMember[],
): ClassMember[] {
    if (!parentClass) {
        return [];
    }

    const nonOverrideNodes: NodeWithType[] = [];

    for (const prop of parentClass.properties) {
        const propName = prop.symbol.getName();

        // Ignore override members
        if (childMembers.some(childMember => childMember.name === propName)) {
            continue;
        }

        const d = prop.symbol.getDeclarations()?.[0];

        if (!d) {
            continue;
        }

        nonOverrideNodes.push({node: d, type: prop.type});
    }

    const inheritedMembers = [
        ...getClassMembersFromPropertiesAndMethods(nonOverrideNodes),
        ...getClassMembersFromPropertyAccessors(nonOverrideNodes),
    ];

    for (const inheritedMember of inheritedMembers) {
        inheritedMember.inheritedFrom = parentName;
    }

    return inheritedMembers;
}

function getClassMembersFromPropertiesAndMethods(
    members: NodeWithType[],
    parentClass?: InheritedSymbol | null,
): ClassMember[] {
    const result: ClassMember[] = [];

    for (const member of members) {
        const {node, type} = member;
        const isProperty = ts.isPropertyDeclaration(node);
        const isPropertyMethod = isProperty &&
            (isArrowFunction(node.initializer) || isFunctionExpression(node.initializer));

        if (ts.isMethodDeclaration(node) || isPropertyMethod) {
            result.push(createMethod({node, type}, parentClass));
            continue;
        }

        if (isProperty) {
            result.push(createFieldFromProperty({node, type}, parentClass));
        }
    }

    return result;
}

function getClassMembersFromPropertyAccessors(
    members: NodeWithType[],
    parentClass?: InheritedSymbol | null,
): ClassMember[] {
    const result: ClassMember[] = [];
    const propertyAccessors = findAllPropertyAccessors(members);

    for (const propertyAccessor in propertyAccessors) {
        const field = createFieldFromPropertyAccessor(propertyAccessors[propertyAccessor], parentClass);

        if (field != null) {
            result.push(field);
        }
    }

    return result;
}

function findAllPropertyAccessors(members: NodeWithType[]): { [key: string]: NodeWithType<PropertyAccessor> } {
    const propertyAccessors: { [key: string]: NodeWithType<PropertyAccessor> } = {};

    for (const member of members) {
        const {node, type} = member;

        if (ts.isGetAccessor(node)) {
            const name = node.name?.getText() ?? '';

            if (!propertyAccessors[name]) {
                propertyAccessors[name] = {node: {}, type};
            }

            propertyAccessors[name].node.getter = node;
        }

        if (ts.isSetAccessor(node)) {
            const name = node.name?.getText() ?? '';

            if (!propertyAccessors[name]) {
                propertyAccessors[name] = {node: {}, type};
            }

            propertyAccessors[name].node.setter = node;
        }
    }

    return propertyAccessors;
}

function createMethod(
    member: NodeWithType<ts.MethodDeclaration | ts.PropertyDeclaration>,
    parentClass?: InheritedSymbol | null,
): ClassMethod {
    const {node, type} = member;
    const tmpl: ClassMethod = {
        kind: DeclarationKind.method,
        ...createFunctionLike(node, type),
    };

    const overrides = isOverride(node) || isInheritedMember(tmpl.name, parentClass);

    tryAddProperty(tmpl, 'static', isStaticMember(node));
    tryAddProperty(tmpl, 'modifier', getVisibilityModifier(node));
    tryAddProperty(tmpl, 'readOnly', isReadOnly(node));
    tryAddProperty(tmpl, 'abstract', isAbstract(node));
    tryAddProperty(tmpl, 'override', overrides);

    return tmpl;
}

function createFieldFromProperty(
    member: NodeWithType<ts.PropertyDeclaration>,
    parentClass?: InheritedSymbol | null,
): ClassField {
    const {node, type} = member;
    const checker = Context.checker;
    const jsDoc = getAllJSDoc(node);
    const name = node.name?.getText() ?? '';
    const defaultValue = findJSDoc<string>(JSDocTagName.default, jsDoc)?.value;
    const computedType = type ? (checker?.typeToString(type) ?? '') : '';
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const overrides = isOverride(node) || isInheritedMember(name, parentClass);

    const tmpl: ClassField = {
        kind: DeclarationKind.field,
        name,
        modifier: getVisibilityModifier(node),
        type: jsDocDefinedType ? {text: jsDocDefinedType} : {text: computedType},
    };

    tryAddProperty(tmpl, 'static', isStaticMember(node));
    tryAddProperty(tmpl, 'optional', !!node.questionToken);
    tryAddProperty(tmpl, 'jsDoc', jsDoc);
    tryAddProperty(tmpl, 'decorators', getDecorators(node));
    tryAddProperty(tmpl, 'default', defaultValue ?? resolveExpression(node.initializer));
    tryAddProperty(tmpl, 'readOnly', isReadOnly(node));
    tryAddProperty(tmpl, 'abstract', isAbstract(node));
    tryAddProperty(tmpl, 'override', overrides);

    return tmpl;
}

function createConstructor(node: ts.ConstructorDeclaration): Constructor {
    const ctor: Constructor = {};

    tryAddProperty(ctor, 'jsDoc', getAllJSDoc(node));
    tryAddProperty(ctor, 'parameters', getParameters(node));

    return ctor;
}

function createFieldFromPropertyAccessor(
    propertyAccessor: NodeWithType<PropertyAccessor>,
    parentClass?: InheritedSymbol | null,
): ClassMember | null {
    const {node, type} = propertyAccessor;
    const {getter, setter} = node;
    const checker = Context.checker;

    if (getter != null) {
        const name = getter.name?.getText();
        const jsDoc = getAllJSDoc(getter);
        const hasReadOnlyTag = findJSDoc<boolean>(JSDocTagName.readonly, jsDoc)?.value;
        const returnStatement = getReturnStatement(getter.body);
        const returnValue = resolveExpression(returnStatement?.expression);
        const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
        const computedType = type ? (checker?.typeToString(type) ?? '') : '';
        const overrides = isOverride(getter) || isInheritedMember(name, parentClass);

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
        tryAddProperty(tmpl, 'readOnly', hasReadOnlyTag ?? setter === undefined);
        tryAddProperty(tmpl, 'default', returnValue);

        return tmpl;
    }

    if (setter == null) {
        return null;
    }

    const name = setter.name?.getText();
    const jsDoc = getAllJSDoc(setter);
    const parameters = getParameters(setter);
    const overrides = isOverride(setter) || isInheritedMember(name, parentClass);

    const tmpl: ClassField = {
        kind: DeclarationKind.field,
        name,
        type: parameters[0]?.type ?? {text: ''},
        writeOnly: true,
    };

    tryAddProperty(tmpl, 'jsDoc', jsDoc);
    tryAddProperty(tmpl, 'static', isStaticMember(setter));
    tryAddProperty(tmpl, 'override', overrides);
    tryAddProperty(tmpl, 'modifier', getVisibilityModifier(setter));
    tryAddProperty(tmpl, 'decorators', getDecorators(setter));

    return tmpl;
}

function resolveDefaultValueFromConstructor(tmpl: ClassDeclaration, ctorDecl: ts.ConstructorDeclaration): void {
    const statements = ctorDecl.body?.statements ?? [];

    for (const statement of statements) {
        if (!ts.isExpressionStatement(statement)) {
            continue;
        }

        const expr = statement.expression;

        if (!ts.isBinaryExpression(expr)) {
            continue;
        }

        const lhs = expr.left;

        // We want something like `this.bar = ...`
        if (!ts.isPropertyAccessExpression(lhs)) {
            continue;
        }

        const lhsName = lhs.name.getText() ?? '';
        const field = tmpl.members?.find(mem => mem.kind === 'field' && mem.name === lhsName) as ClassField | undefined;
        const rhs = expr.right;

        // If the right hand side value is a constructor parameter, we can't resolve the value statically
        if (ts.isIdentifier(rhs) && tmpl.ctor?.parameters?.some(param => param.name === rhs.escapedText)) {
            continue;
        }

        if (field?.default === '') {
            field.default = resolveExpression(rhs);
        }
    }
}
