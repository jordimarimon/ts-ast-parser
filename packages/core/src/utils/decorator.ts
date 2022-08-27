import { Decorator } from '../models/index.js';
import { resolveExpression } from './index.js';
import ts from 'typescript';


export function getDecorators(node: ts.Node): Decorator[] {
    const nodeDecorators = node?.decorators ?? [];
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
        return {name: expr.escapedText ?? ''};
    }

    if (ts.isCallExpression(expr)) {
        const identifier = expr.expression;

        return {
            name: ts.isIdentifier(identifier) ? (identifier.escapedText ?? '') : '',
            parameters: expr.arguments.map(arg => resolveExpression(arg)),
        };
    }

    return null;
}
