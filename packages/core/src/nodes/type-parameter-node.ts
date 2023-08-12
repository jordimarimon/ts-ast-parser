import type { ReflectedNode, ReflectedTypeNode } from '../reflected-node.js';
import type { TypeParameter } from '../models/type-parameter.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition } from '../utils/get-location.js';
import { createType } from '../factories/create-type.js';
import type { AnalyserContext } from '../context.js';
import type ts from 'typescript';


export class TypeParameterNode implements ReflectedNode<TypeParameter, ts.TypeParameterDeclaration> {

    private readonly _node: ts.TypeParameterDeclaration;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypeParameterDeclaration, context: AnalyserContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getTSNode(): ts.TypeParameterDeclaration {
        return this._node;
    }

    getLine(): number {
        return getLinePosition(this._node);
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

    serialize(): TypeParameter {
        const tmpl: TypeParameter = {
            name: this.getName(),
        };

        tryAddProperty(tmpl, 'default', this.getDefault()?.serialize());
        tryAddProperty(tmpl, 'constraint', this.getConstraint()?.serialize());

        return tmpl;
    }

}
