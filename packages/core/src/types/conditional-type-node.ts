import type { ReflectedTypeNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import { createType } from '../factories/create-type.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


/**
 * Represents the reflected conditional type.
 * For example: `type foo<T> = T extends boolean ? 1 : 0`
 */
export class ConditionalTypeNode implements ReflectedTypeNode<ts.ConditionalTypeNode> {

    private readonly _node: ts.ConditionalTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    constructor(node: ts.ConditionalTypeNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTSNode(): ts.ConditionalTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Conditional;
    }

    getText(): string {
        try {
            return this._node.getText() ?? '';
        } catch (_) {
            return this._context.getTypeChecker().typeToString(this._type) ?? '';
        }
    }

    getCheckType(): ReflectedTypeNode {
        return createType(this._node.checkType, this._context);
    }

    getExtendsType(): ReflectedTypeNode {
        return createType(this._node.extendsType, this._context);
    }

    getTrueType(): ReflectedTypeNode {
        return createType(this._node.trueType, this._context);
    }

    getFalseType(): ReflectedTypeNode {
        return createType(this._node.falseType, this._context);
    }

    /**
     * The reflected type as a serializable object
     */
    serialize(): Type {
        return {
            text: this.getText(),
            kind: this.getKind(),
        };
    }
}
