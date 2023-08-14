import type { ReflectedTypeNode } from '../reflected-node.js';
import type { AnalyserContext } from '../analyser-context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';


export class UnknownTypeNode implements ReflectedTypeNode {

    private readonly _node: ts.TypeNode | null;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypeNode | null, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.TypeNode | null {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Unknown;
    }

    getText(): string {
        const keywordNames: { [key in ts.SyntaxKind]?: string } = {
            [ts.SyntaxKind.AnyKeyword]: 'any',
            [ts.SyntaxKind.NeverKeyword]: 'never',
            [ts.SyntaxKind.ObjectKeyword]: 'object',
            [ts.SyntaxKind.UnknownKeyword]: 'unknown',
            [ts.SyntaxKind.IntrinsicKeyword]: 'intrinsic',
        };

        if (this._node && keywordNames[this._node.kind]) {
            return keywordNames[this._node.kind] as string;
        }

        return this._context.getTypeChecker().typeToString(this._type);
    }

    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
        };
    }
}
