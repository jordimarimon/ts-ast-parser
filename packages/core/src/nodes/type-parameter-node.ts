import type { ReflectedNode, ReflectedTypeNode } from '../reflected-node.js';
import type { TypeParameter } from '../models/type-parameter.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import { createType } from '../factories/create-type.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of a type parameter
 */
export class TypeParameterNode implements ReflectedNode<TypeParameter, ts.TypeParameterDeclaration> {

    private readonly _node: ts.TypeParameterDeclaration;

    private readonly _context: ProjectContext;

    constructor(node: ts.TypeParameterDeclaration, context: ProjectContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getTSNode(): ts.TypeParameterDeclaration {
        return this._node;
    }

    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    getDefault(): ReflectedTypeNode | null {
        return this._node.default ? createType(this._node.default, this._context) : null;
    }

    getConstraint(): ReflectedTypeNode | null {
        if (!this._node.constraint) {
            return null;
        }

        return createType(this._node.constraint, this._context);
    }

    hasDefault(): boolean {
        return !!this._node.default;
    }

    /**
     * Serializes the reflected node
     *
     * @returns The reflected node as a serializable object
     */
    serialize(): TypeParameter {
        const tmpl: TypeParameter = {
            name: this.getName(),
        };

        tryAddProperty(tmpl, 'default', this.getDefault()?.serialize());
        tryAddProperty(tmpl, 'constraint', this.getConstraint()?.serialize());

        return tmpl;
    }
}
