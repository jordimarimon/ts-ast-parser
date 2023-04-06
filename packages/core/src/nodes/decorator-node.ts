import { resolveExpression } from '../utils/resolve-expression.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { getLocation } from '../utils/get-location.js';
import { Decorator } from '../models/decorator.js';
import { ReflectedNode } from './reflected-node.js';
import { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


export class DecoratorNode implements ReflectedNode<Decorator, ts.Decorator> {

    private readonly _decorator: ts.Decorator;

    private readonly _context: AnalyzerContext;

    constructor(decorator: ts.Decorator, context: AnalyzerContext) {
        this._decorator = decorator;
        this._context = context;
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

    getTSNode(): ts.Decorator {
        return this._decorator;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getArguments(): unknown[] {
        const expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            return expr.arguments.map(arg => resolveExpression(arg, this._context.checker));
        }

        return [];
    }

    getLine(): number | null {
        const expr = this._decorator.expression;

        if (ts.isIdentifier(expr)) {
            return getLocation(expr, this._context).line;
        }

        if (ts.isCallExpression(expr)) {
            return getLocation(expr.expression, this._context).line;
        }

        return null;
    }

    hasArguments(): boolean {
        return !!this.getArguments().length;
    }

    getPath(): string {
        const expr = this._decorator.expression;

        if (ts.isIdentifier(expr)) {
            return getLocation(expr, this._context).path;
        }

        if (ts.isCallExpression(expr)) {
            return getLocation(expr.expression, this._context).path;
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
