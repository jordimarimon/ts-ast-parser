import { getAliasedSymbolIfNecessary } from './symbol.js';
import { isThirdPartyImport } from './import.js';
import { Context } from '../context.js';
import ts from 'typescript';


export function resolveExpression(expression: ts.Expression | undefined): unknown {
    if (expression == null) {
        return '';
    }

    let expr = expression;

    if (ts.isAsExpression(expression) || ts.isTypeAssertionExpression(expression)) {
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
        return parseStringToFloat(text);
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

    if (ts.isIdentifier(expr) || ts.isPropertyAccessExpression(expr)) {
        return resolveIdentifier(expr);
    }

    return text;
}

function isBooleanLiteral(expr: ts.Expression | ts.Declaration): boolean {
    return expr.kind === ts.SyntaxKind.FalseKeyword || expr.kind === ts.SyntaxKind.TrueKeyword;
}

function parseStringToFloat(text: string): number | string {
    const parsedValue = Number.parseFloat(text);

    if (!isNaN(parsedValue)) {
        return parsedValue;
    }

    return text;
}

function resolveIdentifier(expr: ts.Identifier | ts.PropertyAccessExpression): unknown {
    const checker = Context.checker;
    const reference = getAliasedSymbolIfNecessary(checker?.getSymbolAtLocation(expr));
    const text = expr.getText() ?? '';
    const refExpr = reference?.declarations?.[0];
    const importPath = refExpr?.getSourceFile().fileName ?? '';

    if (refExpr == null) {
        return text;
    }

    // We don't resolve identifiers that come from 3rd party libraries
    if (isThirdPartyImport(importPath)) {
        return text;
    }

    if (ts.isVariableDeclaration(refExpr) || ts.isPropertyDeclaration(refExpr)) {
        return resolveExpression(refExpr.initializer);
    }

    return text;
}
