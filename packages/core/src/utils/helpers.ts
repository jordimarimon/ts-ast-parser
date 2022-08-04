import { Context } from '../context';
import ts from 'typescript';


/**
 * Returns true if the array is not empty
 */
export const isNotEmptyArray = <T = unknown[]>(arr: unknown): arr is T => Array.isArray(arr) && arr.length > 0;

/**
 * Returns true if the class member (property or method) is static
 */
export const isStaticMember = (member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean => {
    return !!member?.modifiers?.some?.(x => x.kind === ts.SyntaxKind.StaticKeyword);
};

/**
 * Returns true if the declaration is one of the following:
 *
 *      function name(...) { ... }
 *
 *      const name = (...) => { ... };
 */
export const isFunctionDeclaration = (node: ts.Node): node is ts.FunctionDeclaration | ts.VariableStatement => {
    if (ts.isFunctionDeclaration(node)) {
        return true;
    }

    if (!ts.isVariableStatement(node)) {
        return false;
    }

    const declaration = node.declarationList?.declarations?.[0];

    if (!declaration) {
        return false;
    }

    return !!declaration.initializer && ts.isArrowFunction(declaration.initializer);
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
 */
export function isCustomElementsDefineCall(node: ts.ExpressionStatement): boolean {
    if (!ts.isCallExpression(node.expression)) {
        return false;
    }

    const functionExpr = node.expression.expression as ts.PropertyAccessExpression;
    const namespaceExpr = functionExpr?.expression as ts.PropertyAccessExpression;

    return (namespaceExpr?.getText() === 'customElements' || namespaceExpr?.name?.escapedText === 'customElements') &&
        functionExpr?.name?.getText() === 'define';
}

export function getType(node: ts.Node | undefined | null): string {
    if (node == null) {
        return '';
    }

    const checker = Context.checker;

    return checker?.typeToString(checker?.getTypeAtLocation(node), node) ?? '';
}
