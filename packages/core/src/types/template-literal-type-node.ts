import type { ReflectedTypeNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


/**
 * Represents a template literal type.
 * For example: ``type foo = `${'a' | 'b'}${'a' | 'b'}` ``
 */
export class TemplateLiteralTypeNode implements ReflectedTypeNode<ts.TemplateLiteralTypeNode> {

    private readonly _node: ts.TemplateLiteralTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    constructor(node: ts.TemplateLiteralTypeNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): ProjectContext {
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
