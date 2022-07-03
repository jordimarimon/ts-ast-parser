import ts from 'typescript';


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
}
