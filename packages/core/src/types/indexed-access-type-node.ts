import type { ReflectedTypeNode } from '../reflected-node.js';
import { createType } from '../factories/create-type.js';
import type { AnalyserContext } from '../context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


export class IndexedAccessTypeNode implements ReflectedTypeNode<ts.IndexedAccessTypeNode> {

    private readonly _node: ts.IndexedAccessTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.IndexedAccessTypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.IndexedAccessTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Unknown;
    }

    getText(): string {
        return `${this.getObjectType().getText()}[${this.getIndexType().getText()}]`;
    }

    getObjectType(): ReflectedTypeNode {
        return createType(this._node.objectType, this._context);
    }

    getIndexType(): ReflectedTypeNode {
        return createType(this._node.indexType, this._context);
    }

    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
        };
    }

}
