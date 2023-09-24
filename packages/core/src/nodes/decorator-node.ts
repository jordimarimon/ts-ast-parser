import { resolveExpression } from '../utils/resolve-expression.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import type { ReflectedNode } from '../reflected-node.js';
import type { Decorator } from '../models/decorator.js';
import { CommentNode } from './comment-node.js';
import ts from 'typescript';


/**
 * Represents the reflected node of a decorator call
 */
export class DecoratorNode implements ReflectedNode<Decorator, ts.Decorator> {

    private readonly _decorator: ts.Decorator;

    private readonly _context: ProjectContext;

    private readonly _jsDoc: CommentNode;

    constructor(decorator: ts.Decorator, context: ProjectContext) {
        this._decorator = decorator;
        this._context = context;
        this._jsDoc = new CommentNode(decorator);
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

    /**
     * The internal TypeScript node
     */
    getTSNode(): ts.Decorator {
        return this._decorator;
    }

    /**
     * The analyser context
     */
    getContext(): ProjectContext {
        return this._context;
    }

    /**
     * The reflected documentation comment
     */
    getJSDoc(): CommentNode {
        return this._jsDoc;
    }

    /**
     * If there are arguments supplied
     */
    hasArguments(): boolean {
        return !!this.getArguments().length;
    }

    /**
     * The values of the arguments supplied in the call
     */
    getArguments(): unknown[] {
        const expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            return expr.arguments.map(arg => resolveExpression(arg, this._context));
        }

        return [];
    }

    /**
     * The line number where the decorator
     * is defined (not where it's used)
     */
    getLine(): number | null {
        const expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            return this._context.getLocation(expr.expression).line;
        }

        return this._context.getLocation(expr).line;
    }

    /**
     * The source file path where the decorator
     * is defined (not where it's used)
     */
    getPath(): string {
        const expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            return this._context.getLocation(expr.expression).path;
        }

        return this._context.getLocation(expr).path;
    }

    /**
     * The reflected node as a serializable object
     */
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
