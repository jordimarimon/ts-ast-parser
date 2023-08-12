import type { ReflectedTypeNode } from './reflected-node.js';
import { createType } from '../factories/create-type.js';
import type { AnalyserContext } from '../context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


export class ArrayTypeNode implements ReflectedTypeNode<ts.ArrayTypeNode> {

    private readonly _node: ts.ArrayTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.ArrayTypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.ArrayTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Array;
    }

    getText(): string {
        return `${this.getElementType().getText()}[]`;
    }

    getElementType(): ReflectedTypeNode {
        return createType(this._node.elementType, this._context);
    }

    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
            elementType: this.getElementType().serialize(),
        };
    }

}
