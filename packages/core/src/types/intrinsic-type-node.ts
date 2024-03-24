import type { ReflectedType } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';


/**
 * Represents an intrinsic type. Intrinsic types are `number`,
 * `string`, `boolean`, `object`, `null`, etc...
 */
export class IntrinsicTypeNode implements ReflectedType {

    private readonly _node: ts.TypeNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    constructor(node: ts.TypeNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTsNode(): ts.TypeNode {
        return this._node;
    }

    getTsType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Intrinsic;
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
            case ts.SyntaxKind.ObjectKeyword:
                return 'object';
            case ts.SyntaxKind.SymbolKeyword:
                return 'symbol';
            case ts.SyntaxKind.BigIntKeyword:
                return 'bigint';
            case ts.SyntaxKind.VoidKeyword:
                return 'void';
            case ts.SyntaxKind.AnyKeyword:
                return 'any';
            default:
                return 'unknown';
        }
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
