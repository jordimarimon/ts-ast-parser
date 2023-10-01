import type { ReflectedTypeNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import { createType } from '../factories/create-type.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


/**
 * Represents an optional type.
 * For example: `type foo = [1, 2?]`
 */
export class OptionalTypeNode implements ReflectedTypeNode<ts.OptionalTypeNode> {

    private readonly _node: ts.OptionalTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    constructor(node: ts.OptionalTypeNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTSNode(): ts.OptionalTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Optional;
    }

    getText(): string {
        return `${this.getElementType().getText()}?`;
    }

    getElementType(): ReflectedTypeNode {
        return createType(this._node.type, this._context);
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
            elementType: this.getElementType().serialize(),
        };
    }
}
