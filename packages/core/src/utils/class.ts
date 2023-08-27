import ts from 'typescript';


/**
 * Type predicate function that returns true if the node is a `ts.ClassDeclaration` or a
 * `ts.VariableStatement` that has as initializer a `ts.ClassExpression`.
 *
 * @param node - The `ts.Node` to check
 * @returns The node is a ClassDeclaration or a ClassExpression
 */
export function isClassDeclaration(node: ts.Node): node is ts.ClassDeclaration | ts.VariableStatement {
    if (ts.isClassDeclaration(node)) {
        return true;
    }

    if (!ts.isVariableStatement(node)) {
        return false;
    }

    const declaration = node.declarationList.declarations[0];

    if (!declaration) {
        return false;
    }

    const initializer = declaration.initializer;

    //
    // case of:
    //
    //      const Foo = class {}
    //
    return !!initializer && ts.isClassExpression(initializer);
}
