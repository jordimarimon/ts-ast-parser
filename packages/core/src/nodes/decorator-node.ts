import { resolveExpression } from '../utils/resolve-expression.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { AnalyserContext } from '../analyser-context.js';
import type { ReflectedNode } from '../reflected-node.js';
import type { Decorator } from '../models/decorator.js';
import { JSDocNode } from './jsdoc-node.js';
import ts from 'typescript';


/**
 * The reflected node when a decorator call is found
 */
export class DecoratorNode implements ReflectedNode<Decorator, ts.Decorator> {

    private readonly _decorator: ts.Decorator;

    private readonly _context: AnalyserContext;

    private readonly _jsDoc: JSDocNode;

    constructor(decorator: ts.Decorator, context: AnalyserContext) {
        this._decorator = decorator;
        this._context = context;
        this._jsDoc = new JSDocNode(decorator);
    }

    /**
     * The name of the decorator
     */
    getName(): string {
        let expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            expr = expr.expression;
        }

        return expr.getText();
    }

    getTSNode(): ts.Decorator {
        return this._decorator;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    /**
     * The JSDoc comments
     */
    getJSDoc(): JSDocNode {
        return this._jsDoc;
    }

    getArguments(): unknown[] {
        const expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            return expr.arguments.map(arg => resolveExpression(arg, this._context));
        }

        return [];
    }

    getLine(): number | null {
        const expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            return this._context.getLocation(expr.expression).line;
        }

        return this._context.getLocation(expr).line;
    }

    hasArguments(): boolean {
        return !!this.getArguments().length;
    }

    getPath(): string {
        const expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            return this._context.getLocation(expr.expression).path;
        }

        return this._context.getLocation(expr).path;
    }

    serialize(): Decorator {
        const path = this.getPath();
        const line = this.getLine();
        const tmpl: Decorator = {
            name: this.getName(),
        };

        if (line != null) {
            tmpl.source = { path, line };
        }

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'arguments', this.getArguments());

        return tmpl;
    }
}
