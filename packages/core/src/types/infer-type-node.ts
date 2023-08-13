import type { ReflectedTypeNode } from '../reflected-node.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { createType } from '../factories/create-type.js';
import type { AnalyserContext } from '../context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';

export class InferTypeNode implements ReflectedTypeNode<ts.InferTypeNode> {
    private readonly _node: ts.InferTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.InferTypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.InferTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Infer;
    }

    getText(): string {
        const constraint = this.getConstraint();
        const name = this._node.typeParameter.name.text;

        if (constraint) {
            return `infer ${name} extends ${constraint.getText()}`;
        }

        return `infer ${name}`;
    }

    getConstraint(): ReflectedTypeNode | null {
        const constraint = this._node.typeParameter.constraint;

        if (!constraint) {
            return null;
        }

        return createType(constraint, this._context);
    }

    serialize(): Type {
        const tmpl: Type = {
            text: this.getText(),
            kind: this.getKind(),
        };

        tryAddProperty(tmpl, 'constraint', this.getConstraint()?.serialize());

        return tmpl;
    }
}
