import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from './symbol.js';
import { isThirdParty } from './import.js';
import ts from 'typescript';


export function resolveExpression(expression: ts.Expression | undefined, checker: ts.TypeChecker): unknown {
    let expr = expression;

    if (expr == null) {
        return undefined;
    }

    if (
        ts.isAsExpression(expr) ||
        ts.isTypeAssertionExpression(expr) ||
        ts.isParenthesizedExpression(expr) ||
        ts.isComputedPropertyName(expr)
    ) {
        expr = expr.expression;
    }

    if (ts.isPrefixUnaryExpression(expr)) {
        return applyPrefixUnaryOperatorToValue(expr, checker);
    }

    if (expr == null) {
        return undefined;
    }

    const text = expr.getText() ?? '';

    if (ts.isStringLiteralLike(expr) || ts.isArrayLiteralExpression(expr) || ts.isObjectLiteralExpression(expr)) {
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
        return resolveIdentifier(expr, checker);
    }

    return text;
}

function isBooleanLiteral(expr: ts.Expression | ts.Declaration): boolean {
    return expr.kind === ts.SyntaxKind.FalseKeyword || expr.kind === ts.SyntaxKind.TrueKeyword;
}

function parseStringToFloat(text: string): number | string {
    const parsedValue = parseFloat(text);

    if (!isNaN(parsedValue)) {
        return parsedValue;
    }

    return text;
}

function resolveIdentifier(expr: ts.Identifier | ts.PropertyAccessExpression, checker: ts.TypeChecker): unknown {
    const reference = getAliasedSymbolIfNecessary(getSymbolAtLocation(expr, checker), checker);
    const text = expr.getText() ?? '';
    const refExpr = reference?.declarations?.[0];
    const importPath = refExpr?.getSourceFile().fileName ?? '';

    if (refExpr == null) {
        return text;
    }

    // We don't resolve identifiers that come from 3rd party libraries
    if (isThirdParty(importPath)) {
        return text;
    }

    if (ts.isVariableDeclaration(refExpr) || ts.isPropertyDeclaration(refExpr)) {
        return resolveExpression(refExpr.initializer, checker);
    }

    return text;
}

function applyPrefixUnaryOperatorToValue(expression: ts.PrefixUnaryExpression, checker: ts.TypeChecker): unknown {
    const value = resolveExpression(expression.operand, checker);

    if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean') {
        return value;
    }

    switch (expression.operator) {
        case ts.SyntaxKind.MinusToken:
            return -value;
        case ts.SyntaxKind.ExclamationToken:
            return !value;
        case ts.SyntaxKind.PlusToken:
            return +value;
        default:
            return value;
    }
}
