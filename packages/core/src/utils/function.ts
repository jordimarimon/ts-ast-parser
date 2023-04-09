import ts from 'typescript';


export function getReturnStatement(node: ts.Block | undefined): ts.ReturnStatement | undefined {
    return node?.statements.find(ts.isReturnStatement);
}

export function isArrowFunction(expr: ts.Expression | undefined): expr is ts.ArrowFunction {
    return expr != null && ts.isArrowFunction(expr);
}

export function isFunctionExpression(expr: ts.Expression | undefined): expr is ts.FunctionExpression {
    return expr != null && ts.isFunctionExpression(expr);
}

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

    // If it's not a function declaration, we only care about case like:
    //
    //      const name = (...) => { ... };
    //
    if (!ts.isVariableStatement(node)) {
        return false;
    }

    const declaration = node.declarationList?.declarations?.[0];

    if (!declaration) {
        return false;
    }

    const initializer = declaration.initializer;

    return !!initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
}
