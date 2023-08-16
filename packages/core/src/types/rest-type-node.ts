import type { ReflectedTypeNode } from '../reflected-node.js';
import type { AnalyserContext } from '../analyser-context.js';
import { createType } from '../factories/create-type.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


/**
 * Represents a rest type.
 * For example: `type foo = [1, ...2[]]`
 */
export class RestTypeNode implements ReflectedTypeNode<ts.RestTypeNode> {

    private readonly _node: ts.RestTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.RestTypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.RestTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Rest;
    }

    getText(): string {
        return `...${this.getElementType().getText()}`;
    }

    getElementType(): ReflectedTypeNode {
        return createType(this._node.type, this._context);
    }

    /**
     * The reflected type as a serializable object
     */
    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
            elementType: this.getElementType().serialize(),
        };
    }
}
