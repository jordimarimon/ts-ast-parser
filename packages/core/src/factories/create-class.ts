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
    getInheritanceChainRefs,
    getParameters,
    getParentSymbol,
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
    const parentSymbol = getParentSymbol(node);
    const classMembers = Array.from(node.members);

    let resultMembers = [
        ...getClassMembersFromPropertiesAndMethods(classMembers, parentSymbol),
        ...getClassMembersFromPropertyAccessors(classMembers, parentSymbol),
    ];
    resultMembers = [
        ...getInheritedMembers(parentSymbol, resultMembers),
        ...resultMembers,
    ];

    tryAddProperty(tmpl, 'decorators', getDecorators(node));
    tryAddProperty(tmpl, 'jsDoc', getAllJSDoc(node));
    tryAddProperty(tmpl, 'typeParameters', getTypeParameters(node));
    tryAddProperty(tmpl, 'heritage', getInheritanceChainRefs(node));
    tryAddProperty(tmpl, 'abstract', isAbstract(node));
    tryAddProperty(tmpl, 'members', resultMembers);

    if (ctorDecl !== undefined) {
        tryAddProperty(tmpl, 'ctor', createConstructor(ctorDecl));
        resolveDefaultValueFromConstructor(tmpl, ctorDecl);
    }

    moduleDoc.declarations.push(tmpl);
}

function getInheritedMembers(parentSymbol: InheritedSymbol | null, childMembers: ClassMember[]): ClassMember[] {
    if (!parentSymbol) {
        return [];
    }

    const parentClassName = parentSymbol?.symbol?.getName() ?? '';

    // Parent members that haven't been override
    const nonOverrideNodes: ts.Node[] = [];

    for (const parentMemberNode of parentSymbol.properties) {
        const parentMemberNodeName = parentMemberNode.getName();

        if (childMembers.some(childMember => childMember.name === parentMemberNodeName)) {
            continue;
        }

        const decl = parentMemberNode.getDeclarations()?.[0];

        if (!decl) {
            continue;
        }

        nonOverrideNodes.push(decl);
    }

    const inheritedMembers = [
        ...getClassMembersFromPropertiesAndMethods(nonOverrideNodes, null),
        ...getClassMembersFromPropertyAccessors(nonOverrideNodes, null),
    ];

    for (const inheritedMember of inheritedMembers) {
        inheritedMember.inheritedFrom = parentClassName;
    }

    return inheritedMembers;
}

function getClassMembersFromPropertiesAndMethods(
    members: ts.Node[],
    parentSymbol: InheritedSymbol | null,
): ClassMember[] {
    const result: ClassMember[] = [];

    for (const member of members) {
        const isProperty = ts.isPropertyDeclaration(member);
        const isPropertyMethod = isProperty &&
            (isArrowFunction(member.initializer) || isFunctionExpression(member.initializer));

        if (ts.isMethodDeclaration(member) || isPropertyMethod) {
            result.push(createMethod(member, parentSymbol));
            continue;
        }

        if (isProperty) {
            result.push(createFieldFromProperty(member, parentSymbol));
        }
    }

    return result;
}

function getClassMembersFromPropertyAccessors(members: ts.Node[], parentSymbol: InheritedSymbol | null): ClassMember[] {
    const result: ClassMember[] = [];
    const propertyAccessors = findAllPropertyAccessors(members);

    for (const propertyAccessor in propertyAccessors) {
        const field = createFieldFromPropertyAccessor(propertyAccessors[propertyAccessor], parentSymbol);

        if (field != null) {
            result.push(field);
        }
    }

    return result;
}

function findAllPropertyAccessors(members: ts.Node[]): { [key: string]: PropertyAccessor } {
    const propertyAccessors: { [key: string]: PropertyAccessor } = {};

    for (const member of members) {
        if (ts.isGetAccessor(member)) {
            const name = member.name?.getText() ?? '';

            if (!propertyAccessors[name]) {
                propertyAccessors[name] = {};
            }

            propertyAccessors[name].getter = member;
        }

        if (ts.isSetAccessor(member)) {
            const name = member.name?.getText() ?? '';

            if (!propertyAccessors[name]) {
                propertyAccessors[name] = {};
            }

            propertyAccessors[name].setter = member;
        }
    }

    return propertyAccessors;
}

function createMethod(
    node: ts.MethodDeclaration | ts.PropertyDeclaration,
    parentSymbol: InheritedSymbol | null,
): ClassMethod {
    const tmpl: ClassMethod = {
        kind: 'method',
        ...createFunctionLike(node),
    };

    const overrides = isOverride(node) || isInheritedMember(tmpl.name, parentSymbol);

    tryAddProperty(tmpl, 'static', isStaticMember(node));
    tryAddProperty(tmpl, 'modifier', getVisibilityModifier(node));
    tryAddProperty(tmpl, 'readOnly', isReadOnly(node));
    tryAddProperty(tmpl, 'abstract', isAbstract(node));
    tryAddProperty(tmpl, 'override', overrides);

    return tmpl;
}

function createFieldFromProperty(node: ts.PropertyDeclaration, parentSymbol: InheritedSymbol | null): ClassField {
    const jsDoc = getAllJSDoc(node);
    const name = node.name?.getText() ?? '';
    const defaultValue = findJSDoc<string>(JSDocTagName.default, jsDoc)?.value;
    const userDefinedType = node.type?.getText();
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;
    const computedType = getType(node);
    const overrides = isOverride(node) || isInheritedMember(name, parentSymbol);

    const tmpl: ClassField = {
        kind: DeclarationKind.field,
        name,
        modifier: getVisibilityModifier(node),
        type: jsDocDefinedType
            ? {text: jsDocDefinedType}
            : {text: userDefinedType ?? computedType},
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
    propertyAccessor: PropertyAccessor,
    parentSymbol: InheritedSymbol | null,
): ClassMember | null {
    const {getter, setter} = propertyAccessor;
    const checker = Context.checker;

    if (getter != null) {
        const name = getter.name?.getText();
        const jsDoc = getAllJSDoc(getter);
        const hasReadOnlyTag = findJSDoc<boolean>(JSDocTagName.readonly, jsDoc)?.value;
        const returnStatement = getReturnStatement(getter.body);
        const returnValue = resolveExpression(returnStatement?.expression);

        // If user specifies the type in the JSDoc -> we take it
        const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;

        // The computed type from the TypeScript TypeChecker (as a last resource)
        const computedType = checker?.typeToString(checker?.getTypeAtLocation(getter), getter) || '';

        const overrides = isOverride(getter) || isInheritedMember(name, parentSymbol);

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
    const overrides = isOverride(setter) || isInheritedMember(name, parentSymbol);

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
