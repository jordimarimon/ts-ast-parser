import ts from 'typescript';


export function getReturnStatement(node: ts.Block | undefined): ts.ReturnStatement | undefined {
    return node?.statements.find(ts.isReturnStatement);
}

export function getReturnValue(returnStatement: ts.ReturnStatement | undefined): string {
    if (returnStatement == undefined) {
        return '';
    }

    const expr = returnStatement.expression;

    if (expr != undefined && ts.isAsExpression(expr)) {
        return expr.expression.getText() ?? '';
    }

    return expr?.getText() ?? '';
}
