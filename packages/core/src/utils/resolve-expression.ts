import type { ProjectContext } from '../project-context.js';
import { isThirdParty } from './import.js';
import ts from 'typescript';


export function resolveExpression(expression: ts.Expression | undefined, context: ProjectContext): unknown {
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
        return applyPrefixUnaryOperatorToValue(expr, context);
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
        return resolveIdentifier(expr, context);
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

function resolveIdentifier(expr: ts.Identifier | ts.PropertyAccessExpression, context: ProjectContext): unknown {
    const reference = context.getSymbol(expr);
    const text = expr.getText() ?? '';
    const refExpr = reference?.declarations?.[0];
    const fileName = refExpr?.getSourceFile().fileName ?? '';
    const importPath = fileName ? context.getSystem().realpath(fileName) : '';

    if (refExpr == null) {
        return text;
    }

    // We don't resolve identifiers that come from 3rd party libraries
    if (isThirdParty(importPath)) {
        return text;
    }

    if (ts.isVariableDeclaration(refExpr) || ts.isPropertyDeclaration(refExpr)) {
        return resolveExpression(refExpr.initializer, context);
    }

    return text;
}

function applyPrefixUnaryOperatorToValue(expression: ts.PrefixUnaryExpression, context: ProjectContext): unknown {
    const value = resolveExpression(expression.operand, context);

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
