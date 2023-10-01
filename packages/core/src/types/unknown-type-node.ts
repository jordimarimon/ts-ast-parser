import type { ReflectedTypeNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';


/**
 * Represents any type that we weren't able to associate with any of the existing types.
 * Also, the `unknown` keyword is reflected using this node.
 */
export class UnknownTypeNode implements ReflectedTypeNode {

    private readonly _node: ts.TypeNode | null;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    constructor(node: ts.TypeNode | null, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): ProjectContext {
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

        const text = this._node && keywordNames[this._node.kind];
        if (text) {
            return text;
        }

        return this._context.getTypeChecker().typeToString(this._type);
    }

    /**
     * Serializes the reflected type
     *
     * @returns The type as a serializable object
     */
    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
        };
    }
}
