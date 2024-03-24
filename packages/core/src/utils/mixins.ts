import { ExpressionNode } from '../nodes/expression-node.js';
import type { ProjectContext } from '../project-context.js';
import type { MixinNodes } from '../models/mixin.js';
import ts from 'typescript';


//
// Extracts the function and class nodes that are used to define a Mixin
//

export function extractMixinNodes(node: ts.Node, context: ProjectContext): MixinNodes | null {
    if (ts.isVariableStatement(node)) {
        extractMixinNodesFromVariableStatement(node, context);
    }

    if (ts.isFunctionDeclaration(node)) {
        extractMixinNodesFromFunctionDeclaration(node, context);
    }

    return null;
}

function extractMixinNodesFromVariableStatement(
    node: ts.VariableStatement,
    context: ProjectContext,
): MixinNodes | null {
    //
    // CASE 1: We have a mixin declared in the form of:
    //
    //      const MyMixin = clazz => class MyMixin extends clazz {}
    // or
    //      export const MyMixin = clazz => class MyMixin extends clazz {}
    //
    const variableDeclaration = node.declarationList.declarations.find(ts.isVariableDeclaration);

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
        const returnStatement = body.statements.find(ts.isReturnStatement);

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

        const classDeclaration = body.statements.find(ts.isClassDeclaration);

        if (classDeclaration == null) {
            return null;
        }

        const classDeclarationName = classDeclaration.name?.getText();
        const returnValue = returnStatement?.expression
            ? new ExpressionNode(returnStatement.expression, context)
            : undefined;

        if (classDeclarationName === returnValue?.getText()) {
            return {
                function: node,
                class: classDeclaration,
            };
        }
    }

    return null;
}

function extractMixinNodesFromFunctionDeclaration(
    node: ts.FunctionDeclaration,
    context: ProjectContext,
): MixinNodes | null {
    if (node.body == null || !ts.isBlock(node.body)) {
        return null;
    }

    const returnStatement = node.body.statements.find(ts.isReturnStatement);

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
    const classDeclaration = node.body.statements.find(ts.isClassDeclaration);

    if (classDeclaration == null) {
        return null;
    }

    const classDeclarationName = classDeclaration.name?.getText();
    const returnValue = returnStatement?.expression
        ? new ExpressionNode(returnStatement.expression, context)
        : undefined;

    if (classDeclarationName === returnValue?.getText()) {
        return {
            function: node,
            class: classDeclaration,
        };
    }

    return null;
}
