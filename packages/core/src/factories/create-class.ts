import { createFunctionLike, isArrowFunction, isFunctionExpression } from './create-function.js';
import { Context } from '../context.js';
import ts from 'typescript';
import {
    ClassDeclaration,
    ClassField,
    ClassMember,
    ClassMethod,
    Constructor,
    JSDocTagName,
    ModifierType,
    Module,
} from '../models/index.js';
import {
    findJSDoc,
    getAllJSDoc,
    getDefaultValue,
    getParameters,
    getTypeParameters,
    shouldIgnore,
} from '../utils/index.js';


export function createClass(node: ts.ClassDeclaration | ts.ClassExpression, moduleDoc: Module): void {
    const name = node.name?.getText();
    const alreadyExists = moduleDoc?.declarations?.some(decl => decl.name === name);

    if (alreadyExists) {
        return;
    }

    const tmpl: ClassDeclaration = {
        name: name ?? '',
        kind: 'class',
        jsDoc: getAllJSDoc(node),
        decorators: [],
        typeParameters: getTypeParameters(node),
        heritage: [],
        members: getClassMembers(node),
        constructors: node.members
            .filter((member): member is ts.ConstructorDeclaration => {
                return ts.isConstructorDeclaration(member);
            })
            .map(member => createConstructor(member)),
    };

    moduleDoc.declarations.push(tmpl);
}

function getClassMembers(node: ts.ClassDeclaration | ts.ClassExpression): ClassMember[] {
    const members: ClassMember[] = [];

    for (const member of node.members) {
        const isProperty = ts.isPropertyDeclaration(member);
        const isPropertyMethod = isProperty &&
            (isArrowFunction(member.initializer) || isFunctionExpression(member.initializer));

        if (shouldIgnore(member) || hasNonPublicModifier(member)) {
            continue;
        }

        if (ts.isMethodDeclaration(member) || isPropertyMethod) {
            members.push(createMethod(member));
            continue;
        }

        if (isProperty) {
            members.push(createField(member));
        }
    }

    return members;
}

function createMethod(node: ts.MethodDeclaration | ts.PropertyDeclaration): ClassMethod {
    return {
        ...createFunctionLike(node),
        kind: 'method',
        static: isStaticMember(node),
        modifier: ModifierType.public,
        readonly: isReadOnly(node),
    };
}

function createField(node: ts.PropertyDeclaration): ClassField {
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
        modifier: ModifierType.public,
        optional: !!node.questionToken,
        jsDoc,
        decorators: [],
        default: defaultValue ?? getDefaultValue(node),
        name: node.name?.getText() ?? '',
        readonly: isReadOnly(node),
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

function hasNonPublicModifier(member: ts.ClassElement): boolean {
    return !!member.modifiers?.some(mod => {
        return mod.kind === ts.SyntaxKind.PrivateKeyword || mod.kind === ts.SyntaxKind.ProtectedKeyword;
    });
}

function isReadOnly(member: ts.ClassElement): boolean {
    return !!member.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ReadonlyKeyword);
}

function isStaticMember(member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean {
    return !!member?.modifiers?.some?.(x => x.kind === ts.SyntaxKind.StaticKeyword);
}
