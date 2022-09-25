import { resolveExpression } from './resolve-expression.js';
import { getLocation } from './get-location.js';
import { Decorator } from '../models/index.js';
import ts from 'typescript';


export function getDecorators(node: ts.Node): Decorator[] {
    const nodeDecorators = ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
    const resultDecorators: Decorator[] = [];

    for (const decorator of nodeDecorators) {
        const createdDec = createDecorator(decorator);

        if (createdDec) {
            resultDecorators.push(createdDec);
        }
    }

    return resultDecorators;
}

export function createDecorator(decorator: ts.Decorator): Decorator | null {
    const expr = decorator.expression;

    if (ts.isIdentifier(expr)) {
        const {path} = getLocation(expr);

        return {
            name: expr.escapedText ?? '',
            source: {path},
        };
    }

    if (ts.isCallExpression(expr)) {
        const identifier = expr.expression;
        const {path} = getLocation(identifier);

        return {
            name: ts.isIdentifier(identifier) ? (identifier.escapedText ?? '') : '',
            arguments: expr.arguments.map(arg => resolveExpression(arg)),
            source: {path},
        };
    }

    return null;
}
