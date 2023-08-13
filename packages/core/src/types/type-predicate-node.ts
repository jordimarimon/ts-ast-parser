import type { ReflectedTypeNode } from '../reflected-node.js';
import { createType } from '../factories/create-type.js';
import type { AnalyserContext } from '../context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';

export class TypePredicateNode implements ReflectedTypeNode<ts.TypePredicateNode> {
    private readonly _node: ts.TypePredicateNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypePredicateNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.TypePredicateNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Predicate;
    }

    getText(): string {
        const name = ts.isThisTypeNode(this._node.parameterName) ? 'this' : this._node.parameterName.getText();

        const out = this.asserts() ? ['asserts', name] : [name];
        const targetType = this.getTargetType();

        if (targetType) {
            out.push('is', targetType.getText());
        }

        return out.join(' ');
    }

    getTargetType(): ReflectedTypeNode | null {
        if (!this._node.type) {
            return null;
        }

        return createType(this._node.type, this._context);
    }

    asserts(): boolean {
        return !!this._node.assertsModifier;
    }

    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
        };
    }
}
