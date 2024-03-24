import { ExpressionNode } from '../nodes/expression-node.js';
import type { ProjectContext } from '../project-context.js';
import type { ReflectedType } from '../reflected-node.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';


/**
 * Represents a literal type.
 * For example: `type foo = 4`
 */
export class LiteralTypeNode implements ReflectedType<ts.LiteralTypeNode> {

    private readonly _node: ts.LiteralTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    constructor(node: ts.LiteralTypeNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTsNode(): ts.LiteralTypeNode {
        return this._node;
    }

    getTsType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Literal;
    }

    getText(): string {
        return (new ExpressionNode(this._node.literal, this._context)).getText();
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
