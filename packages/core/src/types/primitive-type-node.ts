import type { ReflectedTypeNode } from '../reflected-node.js';
import type { AnalyserContext } from '../context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';

export class PrimitiveTypeNode implements ReflectedTypeNode {
    private readonly _node: ts.TypeNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypeNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.TypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Primitive;
    }

    getText(): string {
        switch (this._node.kind) {
            case ts.SyntaxKind.NumberKeyword:
                return 'number';
            case ts.SyntaxKind.BooleanKeyword:
                return 'boolean';
            case ts.SyntaxKind.StringKeyword:
                return 'string';
            case ts.SyntaxKind.UndefinedKeyword:
                return 'undefined';
            case ts.SyntaxKind.NullKeyword:
                return 'null';
            case ts.SyntaxKind.SymbolKeyword:
                return 'symbol';
            case ts.SyntaxKind.BigIntKeyword:
                return 'bigint';
            case ts.SyntaxKind.VoidKeyword:
                return 'void';
            default:
                return this._context.checker.typeToString(this._type) ?? '';
        }
    }

    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
        };
    }
}
