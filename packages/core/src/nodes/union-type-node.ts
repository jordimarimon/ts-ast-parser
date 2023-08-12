import type { ReflectedTypeNode } from './reflected-node.js';
import { createType } from '../factories/create-type.js';
import type { AnalyserContext } from '../context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


export class UnionTypeNode implements ReflectedTypeNode<ts.UnionTypeNode> {

    private readonly _node: ts.UnionTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.UnionTypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.UnionTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Union;
    }

    getText(): string {
        try {
            return this._node.getText() ?? '';
        } catch (_) {
            return this._context.checker.typeToString(this._type) ?? '';
        }
    }

    getElements(): ReflectedTypeNode[] {
        return this._node.types.map(typeNode => createType(typeNode, this._context));
    }

    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
            elements: this.getElements().map(e => e.serialize()),
        };
    }

}
