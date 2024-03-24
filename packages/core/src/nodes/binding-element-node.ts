import type { BindingElement } from '../models/binding-element.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import type { ReflectedNode } from '../reflected-node.js';
import { ExpressionNode } from './expression-node.js';
import ts from 'typescript';


/**
 * Represents the reflected binding element node.
 *
 * A binding element appears in the named parameters of a signature.
 */
export class BindingElementNode implements ReflectedNode<BindingElement, ts.BindingElement | ts.OmittedExpression> {

    private readonly _node: ts.BindingElement | ts.OmittedExpression;

    private readonly _context: ProjectContext;

    constructor(node: ts.BindingElement | ts.OmittedExpression, context: ProjectContext) {
        this._node = node;
        this._context = context;
    }

    /**
     * The TypeScript AST node related to this reflected node
     *
     * @returns The original TypeScript node
     */
    getTsNode(): ts.BindingElement | ts.OmittedExpression {
        return this._node;
    }

    /**
     * The context includes useful APIs that are shared across
     * all the reflected symbols.
     *
     * Some APIs include the parsed configuration options, the
     * system interface, the type checker
     *
     * @returns The analyser context
     */
    getContext(): ProjectContext {
        return this._context;
    }

    /**
     * Reads the name of the binding element node
     *
     * @returns The name of the binding element
     */
    getName(): string {
        return ts.isOmittedExpression(this._node)
            ? '_'
            : this._node.name.getText();
    }

    /**
     * The default value of the binding element.
     *
     * @returns The default value, otherwise it will return `undefined`
     */
    getDefault(): ExpressionNode | undefined {
        if (ts.isOmittedExpression(this._node)) {
            return undefined;
        }

        return this._node.initializer
            ? new ExpressionNode(this._node.initializer, this._context)
            : undefined;
    }

    /**
     * Serializes the reflected node
     *
     * @returns The reflected node as a serializable object
     */
    serialize(): BindingElement {
        const tmpl: BindingElement = {
            name: this.getName(),
        };

        tryAddProperty(tmpl, 'default', this.getDefault()?.serialize());

        return tmpl;
    }
}
