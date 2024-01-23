import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedTypeNode } from '../reflected-node.js';
import type { SourceReference } from '../models/reference.js';
import type { ProjectContext } from '../project-context.js';
import { createType } from '../factories/create-type.js';
import type { SymbolWithLocation } from '../utils/types.js';
import { isThirdParty } from '../utils/import.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';


/**
 * Represents a type query.
 * For example: `type foo = typeof Foo` where `Foo` could be a class declaration.
 */
export class TypeQueryNode implements ReflectedTypeNode<ts.TypeQueryNode> {

    private readonly _node: ts.TypeQueryNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    private readonly _loc: SymbolWithLocation;

    constructor(node: ts.TypeQueryNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
        this._loc = context.getLocation(node.exprName);
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTSNode(): ts.TypeQueryNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Query;
    }

    getPath(): string {
        return this._loc.path;
    }

    getLine(): number | null {
        return this._loc.line;
    }

    getText(): string {
        return this._context.getTypeChecker().typeToString(this._type);
    }

    getTypeArguments(): ReflectedTypeNode[] {
        return (this._node.typeArguments ?? []).map(t => createType(t, this._context));
    }

    /**
     * Serializes the reflected type
     *
     * @returns The type as a serializable object
     */
    serialize(): Type {
        const tmpl: Type = {
            text: this.getText(),
            kind: this.getKind(),
        };

        const sourceRef: SourceReference = {};
        const path = this.getPath();
        const line = this.getLine();

        if (!isThirdParty(path) && line != null) {
            sourceRef.line = line;
            sourceRef.path = path;
        }

        tryAddProperty(tmpl, 'source', sourceRef);
        tryAddProperty(tmpl, 'typeArguments', this.getTypeArguments().map(t => t.serialize()));

        return tmpl;
    }
}
