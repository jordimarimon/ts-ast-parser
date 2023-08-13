import type { ReflectedTypeNode } from '../reflected-node.js';
import type { AnalyserContext } from '../context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';

export class TemplateLiteralTypeNode implements ReflectedTypeNode<ts.TemplateLiteralTypeNode> {
    private readonly _node: ts.TemplateLiteralTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TemplateLiteralTypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.TemplateLiteralTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.TemplateLiteral;
    }

    getText(): string {
        return this._context.checker.typeToString(this._type);
    }

    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
        };
    }
}
