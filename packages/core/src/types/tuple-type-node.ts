import type { ReflectedTypeNode } from '../reflected-node.js';
import type { AnalyserContext } from '../analyser-context.js';
import { createType } from '../factories/create-type.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


/**
 * Represents a tuple type.
 * For example: `type foo = [number, number]`
 */
export class TupleTypeNode implements ReflectedTypeNode<ts.TupleTypeNode> {

    private readonly _node: ts.TupleTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TupleTypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.TupleTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Tuple;
    }

    getText(): string {
        return `[${this.getElements()
            .map(e => e.getText())
            .join(', ')}]`;
    }

    getElements(): ReflectedTypeNode[] {
        return this._node.elements.map(t => createType(t, this._context));
    }

    /**
     * The reflected type as a serializable object
     */
    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
            elements: this.getElements().map(e => e.serialize()),
        };
    }
}
