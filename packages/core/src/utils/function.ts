import ts from 'typescript';


/**
 * Checks if the node is a function like
 *
 * For example:
 *
 * function name(...) { ... }
 * const name = (...) => { ... }
 * const name = function(...) { ... }
 *
 * @param node - The node to check
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

    return !!initializer &&
        (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
}
