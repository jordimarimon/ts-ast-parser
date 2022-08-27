import { createFunctionLike } from './create-function.js';
import { NodeFactory } from './node-factory.js';
import { Context } from '../context.js';
import ts from 'typescript';
import {
    ClassDeclaration,
    ClassField,
    ClassMember,
    ClassMethod,
    Constructor,
    JSDocTagName,
    Module,
} from '../models/index.js';
import {
    findJSDoc,
    getAllJSDoc,
    getParameters,
    getReturnStatement,
    getTypeParameters,
    getVisibilityModifier,
    isArrowFunction,
    isFunctionExpression,
    isReadOnly,
    isStaticMember,
    resolveExpression,
} from '../utils/index.js';


type PropertyAccessor = { getter?: ts.GetAccessorDeclaration; setter?: ts.SetAccessorDeclaration };

export const classFactory: NodeFactory<ts.ClassDeclaration | ts.ClassExpression> = {

    isNode: isClassNode,

    create: createClass,

};

function isClassNode(node: ts.Node): node is ts.ClassExpression | ts.ClassDeclaration {
    return ts.isClassDeclaration(node) || ts.isClassExpression(node);
}

function createClass(node: ts.ClassDeclaration | ts.ClassExpression, moduleDoc: Module): void {
    const name = node.name?.getText() ?? '';
    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

    if (alreadyExists) {
        return;
    }

    const ctorDecl = node.members.find((member): member is ts.ConstructorDeclaration => {
        return ts.isConstructorDeclaration(member);
    });

    const tmpl: ClassDeclaration = {
        name,
        kind: 'class',
        jsDoc: getAllJSDoc(node),
        decorators: [],
        typeParameters: getTypeParameters(node),
        heritage: [],
        members: [
            ...getClassMembersFromPropertiesAndMethods(node),
            ...getClassMembersFromPropertyAccessors(node),
        ],
    };

    if (ctorDecl !== undefined) {
        tmpl.ctor = createConstructor(ctorDecl);

        resolveDefaultValueFromConstructor(tmpl, ctorDecl);
    }

    moduleDoc.declarations.push(tmpl);
}

function getClassMembersFromPropertiesAndMethods(node: ts.ClassDeclaration | ts.ClassExpression): ClassMember[] {
    const members: ClassMember[] = [];

    for (const member of node.members) {
        const isProperty = ts.isPropertyDeclaration(member);
        const isPropertyMethod = isProperty &&
            (isArrowFunction(member.initializer) || isFunctionExpression(member.initializer));

        if (ts.isMethodDeclaration(member) || isPropertyMethod) {
            members.push(createMethod(member));
            continue;
        }

        if (isProperty) {
            members.push(createFieldFromProperty(member));
        }
    }

    return members;
}

function getClassMembersFromPropertyAccessors(node: ts.ClassDeclaration | ts.ClassExpression): ClassMember[] {
    const members: ClassMember[] = [];
    const propertyAccessors = findAllPropertyAccessors(node.members);

    for (const propertyAccessor in propertyAccessors) {
        const field = createFieldFromPropertyAccessor(propertyAccessors[propertyAccessor]);

        if (field != null) {
            members.push(field);
        }
    }

    return members;
}

function findAllPropertyAccessors(members: ts.NodeArray<ts.ClassElement>): { [key: string]: PropertyAccessor } {
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

function createMethod(node: ts.MethodDeclaration | ts.PropertyDeclaration): ClassMethod {
    return {
        ...createFunctionLike(node),
        kind: 'method',
        static: isStaticMember(node),
        modifier: getVisibilityModifier(node),
        readOnly: isReadOnly(node),
    };
}

function createFieldFromProperty(node: ts.PropertyDeclaration): ClassField {
    const checker = Context.checker;
    const jsDoc = getAllJSDoc(node);

    // If user specifies the type in the declaration (`x: string = "Foo";)
    const userDefinedType = node.type?.getText();

    // If user specifies the type in the JSDoc -> we take it
    const jsDocDefinedType = findJSDoc<string>(JSDocTagName.type, jsDoc)?.value;

    // The computed type from the TypeScript TypeChecker (as a last resource)
    const computedType = checker?.typeToString(checker?.getTypeAtLocation(node), node) || '';

    const defaultValue = findJSDoc<string>(JSDocTagName.default, jsDoc)?.value;

    return {
        kind: 'field',
        static: isStaticMember(node),
        modifier: getVisibilityModifier(node),
        optional: !!node.questionToken,
        jsDoc,
        decorators: [],
        default: defaultValue ?? resolveExpression(node.initializer),
        name: node.name?.getText() ?? '',
        readOnly: isReadOnly(node),
        type: jsDocDefinedType
            ? {text: jsDocDefinedType}
            : {text: userDefinedType ?? computedType},
    };
}

function createConstructor(node: ts.ConstructorDeclaration): Constructor {
    return {
        jsDoc: getAllJSDoc(node),
        parameters: getParameters(node),
    };
}

function createFieldFromPropertyAccessor(propertyAccessor: PropertyAccessor): ClassMember | null {
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

        return {
            name,
            jsDoc,
            kind: 'field',
            decorators: [],
            static: isStaticMember(getter),
            modifier: getVisibilityModifier(getter),
            readOnly: hasReadOnlyTag ?? setter === undefined,
            type: jsDocDefinedType ? {text: jsDocDefinedType} : {text: computedType},
            default: returnValue,
        };
    }

    if (setter == null) {
        return null;
    }

    const name = setter.name?.getText();
    const jsDoc = getAllJSDoc(setter);
    const parameters = getParameters(setter);

    return {
        name,
        kind: 'field',
        static: isStaticMember(setter),
        modifier: getVisibilityModifier(setter),
        writeOnly: true,
        decorators: [],
        type: parameters[0]?.type ?? {text: ''},
        jsDoc,
    };
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
        if (ts.isIdentifier(rhs) && tmpl.ctor?.parameters.some(param => param.name === rhs.escapedText)) {
            continue;
        }

        if (field?.default === '') {
            field.default = resolveExpression(rhs);
        }
    }
}
