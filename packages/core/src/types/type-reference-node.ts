import type { SourceReference } from '../models/reference.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedTypeNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import { createType } from '../factories/create-type.js';
import type { SymbolWithLocation } from '../utils/is.js';
import { isThirdParty } from '../utils/import.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';


/**
 * Represents a type reference. It's basically a type that references another one.
 * For example: `type foo = HTMLElement`
 */
export class TypeReferenceNode implements ReflectedTypeNode<ts.TypeReferenceNode> {

    private readonly _node: ts.TypeReferenceNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    private readonly _loc: SymbolWithLocation;

    constructor(node: ts.TypeReferenceNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;
        this._loc = context.getLocation(node.typeName);
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTSNode(): ts.TypeReferenceNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.Reference;
    }

    getText(): string {
        if ((this._type.flags & ts.TypeFlags.Any) === 0) {
            return this._context.getTypeChecker().typeToString(this._type);
        }

        const refName = ts.isIdentifier(this._node.typeName)
            ? this._node.typeName.text
            : this._node.typeName.right.text;

        const args = this.getTypeArguments().map(t => t.getText());

        return args.length > 0 ? `${refName}<${args.join(', ')}>` : refName;
    }

    getPath(): string {
        return this._loc.path;
    }

    getLine(): number | null {
        return this._loc.line;
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
