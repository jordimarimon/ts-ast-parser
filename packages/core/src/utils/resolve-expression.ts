import ts from 'typescript';


export function resolveExpression(expression: ts.Expression | undefined): string {
    if (expression == null) {
        return '';
    }

    let defaultValue: string | undefined;

    if (ts.isAsExpression(expression)) {
        defaultValue = expression?.expression?.getText();
    } else {
        defaultValue = expression?.getText();
    }

    return defaultValue ?? '';
}
