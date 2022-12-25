import { resolveExpression } from './resolve-expression.js';
import { getLocation } from './get-location.js';
import { Decorator } from '../models/index.js';
import { isTS4_8 } from './version.js';
import ts from 'typescript';


export function getDecorators(node: ts.Node): Decorator[] {
    const resultDecorators: Decorator[] = [];

    let nodeDecorators: readonly ts.Decorator[] = [];

    if (isTS4_8()) {
        nodeDecorators = ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
    } else {
        nodeDecorators = node.decorators ?? [];
    }

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
        const {path, line} = getLocation(expr);
        const name = expr.escapedText ?? '';

        if (path && line != null) {
            return {
                name,
                source: {path, line},
            };
        }

        return {name};
    }

    if (ts.isCallExpression(expr)) {
        const identifier = expr.expression;
        const {path, line} = getLocation(identifier);
        const name = ts.isIdentifier(identifier) ? (identifier.escapedText ?? '') : '';
        const args = expr.arguments.map(arg => resolveExpression(arg));

        if (path && line != null) {
            return {
                name,
                arguments: args,
                source: {path, line},
            };
        }

        return {
            name,
            arguments: args,
            source: {path},
        };
    }

    return null;
}
