import type { ReflectedTypeNode } from '../reflected-node.js';
import { createType } from '../factories/create-type.js';
import type { AnalyserContext } from '../context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


export class TypeOperatorNode implements ReflectedTypeNode<ts.TypeOperatorNode> {

    private readonly _node: ts.TypeOperatorNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypeOperatorNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.TypeOperatorNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Operator;
    }

    getText(): string {
        try {
            return this._node.getText() ?? '';
        } catch (_) {
            return this._context.checker.typeToString(this._type) ?? '';
        }
    }

    getElementType(): ReflectedTypeNode {
        return createType(this._node.type, this._context);
    }

    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
            elementType: this.getElementType().serialize(),
        };
    }

}
