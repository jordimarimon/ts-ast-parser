import type { BindingElement } from '../models/binding-element.js';
import { resolveExpression } from '../utils/resolve-expression.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import type ts from 'typescript';


/**
 * Represents the reflected binding element node.
 * A binding element appears in the named parameters of a signature.
 */
export class BindingElementNode implements ReflectedNode<BindingElement, ts.BindingElement> {

    private readonly _node: ts.BindingElement;

    private readonly _context: ProjectContext;

    constructor(node: ts.BindingElement, context: ProjectContext) {
        this._node = node;
        this._context = context;
    }

    /**
     * The TypeScript AST node related to this reflected node
     *
     * @returns The original TypeScript node
     */
    getTSNode(): ts.BindingElement {
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
        return this._node.name.getText() || '';
    }

    /**
     * The default value of the binding element.
     *
     * @returns The default value, otherwise it will return `undefined`
     */
    getDefault(): unknown {
        return resolveExpression(this._node.initializer, this._context);
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

        tryAddProperty(tmpl, 'default', this.getDefault());

        return tmpl;
    }
}
