import { resolveExpression } from '../utils/resolve-expression.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { getLocation } from '../utils/get-location.js';
import { Decorator } from '../models/decorator.js';
import ts from 'typescript';


export class DecoratorNode {

    private readonly _decorator: ts.Decorator;

    constructor(decorator: ts.Decorator) {
        this._decorator = decorator;
    }

    getName(): string {
        const expr = this._decorator.expression;

        if (ts.isIdentifier(expr)) {
            return expr.escapedText ?? '';
        }

        if (ts.isCallExpression(expr)) {
            const identifier = expr.expression;

            if (ts.isIdentifier(identifier)) {
                return identifier.escapedText ?? '';
            }
        }

        return '';
    }

    getArguments(): unknown[] {
        const expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            return expr.arguments.map(arg => resolveExpression(arg));
        }

        return [];
    }

    getLine(): number | null {
        const expr = this._decorator.expression;

        if (ts.isIdentifier(expr)) {
            return getLocation(expr).line;
        }

        if (ts.isCallExpression(expr)) {
            return getLocation(expr.expression).line;
        }

        return null;
    }

    hasArguments(): boolean {
        return !!this.getArguments().length;
    }

    getPath(): string {
        const expr = this._decorator.expression;

        if (ts.isIdentifier(expr)) {
            return getLocation(expr).path;
        }

        if (ts.isCallExpression(expr)) {
            return getLocation(expr.expression).path;
        }

        return '';
    }

    toPOJO(): Decorator {
        const path = this.getPath();
        const line = this.getLine();
        const tmpl: Decorator = {
            name: this.getName(),
        };

        if (line != null) {
            tmpl.source = {path, line};
        } else {
            tmpl.source = {path};
        }

        tryAddProperty(tmpl, 'arguments', this.getArguments());

        return tmpl;
    }

}
