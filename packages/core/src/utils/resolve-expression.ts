import { Context } from '../context.js';
import ts from 'typescript';


export function resolveExpression(expression: ts.Expression | undefined): unknown {
    if (expression == null) {
        return '';
    }

    let expr = expression;

    if (ts.isAsExpression(expression)) {
        expr = expression.expression;
    }

    if (expr == null) {
        return '';
    }

    const text = expr.getText() ?? '';

    if (ts.isStringLiteral(expr) || ts.isArrayLiteralExpression(expr) || ts.isObjectLiteralExpression(expr)) {
        return text;
    }

    if (ts.isNumericLiteral(expr)) {
        const parsedValue = Number.parseFloat(text);

        if (!isNaN(parsedValue)) {
            return parsedValue;
        }

        return text;
    }

    if (isBooleanLiteral(expr)) {
        return text === 'true';
    }

    if (expr.kind === ts.SyntaxKind.NullKeyword) {
        return null;
    }

    if (expr.kind === ts.SyntaxKind.UndefinedKeyword) {
        return undefined;
    }

    return resolveComplexExpression(expr);
}

function isBooleanLiteral(expr: ts.Expression | ts.Declaration): boolean {
    return expr.kind === ts.SyntaxKind.FalseKeyword || expr.kind === ts.SyntaxKind.TrueKeyword;
}

function resolveComplexExpression(expr: ts.Expression): unknown {
    const checker = Context.checker;
    const text = expr.getText() ?? '';

    if (ts.isIdentifier(expr) || ts.isPropertyAccessExpression(expr)) {
        const reference = checker?.getSymbolAtLocation(expr);

        let refExpr = reference?.declarations?.[0];

        if (refExpr == null) {
            return text;
        }

        if (ts.isImportSpecifier(refExpr)) {
            const importedSymbol = reference && checker?.getAliasedSymbol(reference);

            refExpr = importedSymbol?.declarations?.[0];

            if (refExpr == null) {
                return text;
            }
        }

        if (ts.isVariableDeclaration(refExpr) || ts.isPropertyDeclaration(refExpr)) {
            return resolveExpression(refExpr.initializer);
        }
    }

    return text;
}
