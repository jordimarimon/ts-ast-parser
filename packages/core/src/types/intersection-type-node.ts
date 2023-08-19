import type { ReflectedTypeNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import { createType } from '../factories/create-type.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


/**
 * Represents the reflected intersection type.
 * For example: `type foo = string & number`
 */
export class IntersectionTypeNode implements ReflectedTypeNode<ts.IntersectionTypeNode> {

    private readonly _node: ts.IntersectionTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    constructor(node: ts.IntersectionTypeNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTSNode(): ts.IntersectionTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Intersection;
    }

    getText(): string {
        try {
            return this._node.getText() ?? '';
        } catch (_) {
            return this._context.getTypeChecker().typeToString(this._type) ?? '';
        }
    }

    getElements(): ReflectedTypeNode[] {
        return this._node.types.map(typeNode => createType(typeNode, this._context));
    }

    /**
     * The reflected type as a serializable object
     */
    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
            elements: this.getElements().map(e => e.serialize()),
        };
    }
}
