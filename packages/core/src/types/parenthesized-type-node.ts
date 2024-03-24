import type { ReflectedType } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import { createType } from '../factories/create-type.js';
import { type Type, TypeKind } from '../models/type.js';
import type ts from 'typescript';



export class ParenthesizedTypeNode implements ReflectedType<ts.ParenthesizedTypeNode> {

    private readonly _node: ts.ParenthesizedTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    constructor(node: ts.ParenthesizedTypeNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTsNode(): ts.ParenthesizedTypeNode {
        return this._node;
    }

    getTsType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Parenthesized;
    }

    getText(): string {
        return this._context.getTypeChecker().typeToString(this._type);
    }

    getType(): ReflectedType {
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
            type: this.getType().serialize(),

        };
    }
}
