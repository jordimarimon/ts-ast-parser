import { Type } from '../models';
import ts from 'typescript';


/**
 * Returns true if the array is not empty
 */
export const isNotEmptyArray = <T = unknown[]>(arr: unknown): arr is T => Array.isArray(arr) && arr.length > 0;

/**
 * Returns true if the class member (property or method) is static
 */
export const isStaticMember = (member: ts.PropertyDeclaration): boolean => {
    return !!member?.modifiers?.some?.(x => x.kind === ts.SyntaxKind.StaticKeyword);
};

/**
 * Returns true if the expression includes "as const"
 */
export const isAsConst = (expression: ts.Expression): expression is ts.AsExpression => {
    return ts.isAsExpression(expression) &&
        ts.isTypeReferenceNode(expression.type) &&
        expression.type.typeName.getText() === 'const';
};

/**
 * Checks whether the imported module only specifies its module in the import path,
 * rather than the full or relative path to where it's located:
 *
 *      import lodash from 'lodash'; --> Correct
 *      import foo from './foo.js'; --> Incorrect
 */
export function isBareModuleSpecifier(specifier: string): boolean {
    return !!specifier?.replace(/'/g, '')[0].match(/[@a-zA-Z\d]/g);
}

/**
 * Retrieves the first return statement inside the function body
 */
export const getReturnStatement = (node: ts.Block): ts.ReturnStatement | undefined => {
    return node.statements.find(ts.isReturnStatement);
};

/**
 * Retrieves the first class declaration inside the function body
 */
export const getClassDeclaration = (node: ts.Block): ts.ClassDeclaration | undefined => {
    return node.statements.find(ts.isClassDeclaration);
};

/**
 * Retrieves the first variable declaration in a variable statement
 */
export const getVariableDeclaration = (node: ts.VariableStatement): ts.VariableDeclaration | undefined => {
    return node.declarationList.declarations.find(ts.isVariableDeclaration);
};

/**
 * Get the return value expression of a return statement
 */
export const getReturnValue = (returnStatement: ts.ReturnStatement | undefined): string => {
    if (returnStatement == undefined) {
        return '';
    }

    const expr = returnStatement.expression;

    if (expr != undefined && ts.isAsExpression(expr)) {
        return expr.expression.getText() ?? '';
    }

    return expr?.getText() ?? '';
};

/**
 * Returns the type of variable defined inside the module scope or
 * a property defined inside the class scope.
 */
export function getType(node: ts.VariableDeclaration | ts.PropertyDeclaration): Type {
    let type: Type;

    // If it has a type defined, use it
    if (node.type) {
        type = {text: node.type.getText()};
    } else {
        // Check the type of the expression being used to initialize
        // the variable
        const expr = node.initializer;

        // Check the case where "as const" is being used
        if (expr != undefined && isAsConst(expr)) {
            type = {text: expr.expression?.getText() ?? ''};
        } else {
            type = inferExpressionType(expr);
        }
    }

    // In case of a class property, there may be a question token for undefined
    if (ts.isPropertyDeclaration(node) && node.questionToken) {
        type.text += ' | undefined';
    }

    return type;
}

export function inferExpressionType(expression: ts.Expression | undefined): Type {
    switch (expression?.kind) {
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
            return {text: 'boolean'};

        case ts.SyntaxKind.StringLiteral:
            return {text: 'string'};

        case ts.SyntaxKind.PrefixUnaryExpression:
            return (expression as ts.PrefixUnaryExpression)?.operator === ts.SyntaxKind.ExclamationToken
                ? {text: 'boolean'}
                : {text: 'number'};

        case ts.SyntaxKind.NumericLiteral:
            return {text: 'number'};

        case ts.SyntaxKind.NullKeyword:
            return {text: 'null'};

        case ts.SyntaxKind.ArrayLiteralExpression:
            return {text: 'array'};

        case ts.SyntaxKind.ObjectLiteralExpression:
            return {text: 'object'};

        default:
            return {text: 'unknown'};
    }
}

export function getDefaultValue(node: ts.VariableDeclaration | ts.PropertyDeclaration): string {
    const expr = node.initializer;

    let defaultValue: string | undefined;

    if (expr != undefined && ts.isAsExpression(expr)) {
        defaultValue = expr?.expression?.getText();
    } else {
        defaultValue = expr?.getText();
    }

    return defaultValue ?? '';
}

/**
 * Checking for:
 *
 *      customElements.define('my-el', class MyEl {});
 *      window.customElements.define('my-el', class MyEl {});
 *
 * @param node
 *
 */
export function isCustomElementsDefineCall(node: ts.ExpressionStatement): boolean {
    if (!ts.isCallExpression(node.expression)) {
        return false;
    }

    const functionExpr = node.expression.expression as ts.PropertyAccessExpression;
    const namespaceExpr  = functionExpr?.expression as ts.PropertyAccessExpression;

    return (namespaceExpr?.getText() === 'customElements' || namespaceExpr?.name?.escapedText === 'customElements') &&
        functionExpr?.name?.getText() === 'define';
}
