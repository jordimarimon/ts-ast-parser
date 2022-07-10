import { getClassDeclaration, getReturnStatement, getReturnValue, getVariableDeclaration } from './helpers';
import { MixinNodes } from '../models';
import ts from 'typescript';


/**
 * Extracts the function and class nodes that are used to define a Mixin
 */
export function extractMixinNodes(node: ts.Node): MixinNodes | null {
    if (ts.isVariableStatement(node)) {
        extractMixinNodesFromVariableStatement(node);
    }

    if (ts.isFunctionDeclaration(node)) {
        extractMixinNodesFromFunctionDeclaration(node);
    }

    return null;
}

/**
 *
 *
 * @param node
 */
function extractMixinNodesFromVariableStatement(node: ts.VariableStatement): MixinNodes | null {
    //
    // CASE 1: We have a mixin declared in the form of:
    //
    //      const MyMixin = clazz => class MyMixin extends clazz {}
    // or
    //      export const MyMixin = clazz => class MyMixin extends clazz {}
    //
    const variableDeclaration = getVariableDeclaration(node);

    if (variableDeclaration == null) {
        return null;
    }

    const arrowFunction = variableDeclaration.initializer;

    if (arrowFunction == null || !ts.isArrowFunction(arrowFunction)) {
        return null;
    }

    const body = arrowFunction.body;

    if (ts.isClassExpression(body)) {
        return {
            function: node,
            class: body,
        };
    }

    if (ts.isBlock(body)) {
        const returnStatement = getReturnStatement(body);

        //
        // CASE 2: We have a mixin declared in the form of:
        //
        //      const MyMixin = klass => { return class MyMixin extends Klass{} }
        //
        if (returnStatement != null && ts.isClassExpression(returnStatement)) {
            return {
                function: node,
                class: returnStatement,
            };
        }

        //
        // CASE 3: We have a mixin declared in the form of:
        //
        //      const MyMixin = klass => { class MyMixin extends klass {} return MyMixin;}

        const classDeclaration = getClassDeclaration(body);

        if (classDeclaration == null) {
            return null;
        }

        const classDeclarationName = classDeclaration.name?.getText?.();
        const returnValue = getReturnValue(returnStatement);

        if (classDeclarationName === returnValue) {
            return {
                function: node,
                class: classDeclaration,
            };
        }
    }

    return null;
}

/**
 *
 */
function extractMixinNodesFromFunctionDeclaration(node: ts.FunctionDeclaration): MixinNodes | null {
    if (node.body == null || !ts.isBlock(node.body)) {
        return null;
    }

    const returnStatement = getReturnStatement(node.body);

    //
    // CASE 4: We have a mixin declared in the form of:
    //
    //      function MyMixin(clazz) { return class MyMixin extends clazz {} }
    //
    if (returnStatement?.expression !== undefined && ts.isClassExpression(returnStatement.expression)) {
        return {
            function: node,
            class: returnStatement.expression,
        };
    }

    //
    // CASE 5: We have a mixin declared in the form of:
    //
    //      function MyMixin(clazz) {class A extends clazz {} return A;}
    //
    const classDeclaration = getClassDeclaration(node.body);

    if (classDeclaration == null) {
        return null;
    }

    const classDeclarationName = classDeclaration.name?.getText?.();
    const returnValue = getReturnValue(returnStatement);

    if (classDeclarationName === returnValue) {
        return {
            function: node,
            class: classDeclaration,
        };
    }

    return null;
}
