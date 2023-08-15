import ts from 'typescript';


/**
 * Finds the return statement in the body of a function
 *
 * @param node - The function body node
 *
 * @returns The return statement if found, otherwise undefined
 */
export function getReturnStatement(node: ts.Block | undefined): ts.ReturnStatement | undefined {
    return node?.statements.find(ts.isReturnStatement);
}

/**
 * Checks whether the node is an arrow function
 *
 * For example:
 *
 *      const foo = () => {...}
 *
 * @param node - The node to check
 *
 * @returns True if the node is an arrow function
 */
export function isArrowFunction(node: ts.Node | undefined): node is ts.ArrowFunction {
    return node != null && ts.isArrowFunction(node);
}

/**
 * Checks whether the node is a function expression.
 *
 * For example:
 *
 *      const foo = function() { ... }
 *
 * @param node - The node to check
 *
 * @returns True if the node is a function expression
 */
export function isFunctionExpression(node: ts.Node | undefined): node is ts.FunctionExpression {
    return node != null && ts.isFunctionExpression(node);
}

/**
 * Checks if the node is a function like
 *
 * For example:
 *
 *      function name(...) { ... }
 *      const name = (...) => { ... }
 *      const name = function(...) { ... }
 *
 * @param node - The node to check
 *
 * @returns True if the node is a function like node
 */
export function isFunctionDeclaration(node: ts.Node): node is ts.FunctionDeclaration | ts.VariableStatement {
    if (node == null) {
        return false;
    }

    // Case of:
    //
    //      function name(...) { ... }
    //
    if (ts.isFunctionDeclaration(node)) {
        return true;
    }

    // If it's not a function declaration, we only care about cases like:
    //
    //      const name = (...) => { ... }
    //      const name = function(...) { ... }
    //
    if (!ts.isVariableStatement(node)) {
        return false;
    }

    const declaration = node.declarationList.declarations[0];

    if (!declaration) {
        return false;
    }

    const initializer = declaration.initializer;

    return !!initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
}
