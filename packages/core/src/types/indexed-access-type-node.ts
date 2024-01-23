import type { ReflectedTypeNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import type { SourceReference } from '../models/reference.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { createType } from '../factories/create-type.js';
import type { SymbolWithLocation } from '../utils/types.js';
import { isThirdParty } from '../utils/import.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';


/**
 * Represents the reflected indexed access type.
 * For example: `T['name']`
 */
export class IndexedAccessTypeNode implements ReflectedTypeNode<ts.IndexedAccessTypeNode> {

    private readonly _node: ts.IndexedAccessTypeNode;

    private readonly _type: ts.Type;

    private readonly _context: ProjectContext;

    private readonly _loc: SymbolWithLocation | null = null;

    constructor(node: ts.IndexedAccessTypeNode, type: ts.Type, context: ProjectContext) {
        this._node = node;
        this._type = type;
        this._context = context;

        if (ts.isTypeReferenceNode(node.objectType)) {
            this._loc = context.getLocation(node.objectType.typeName);
        }
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTSNode(): ts.IndexedAccessTypeNode {
        return this._node;
    }

    getTSType(): ts.Type {
        return this._type;
    }

    getKind(): TypeKind {
        return TypeKind.IndexAccess;
    }

    getText(): string {
        return `${this.getObjectType().getText()}[${this.getIndexType().getText()}]`;
    }

    getPath(): string {
        return this._loc?.path ?? '';
    }

    getLine(): number | null {
        return this._loc?.line ?? null;
    }

    getObjectType(): ReflectedTypeNode {
        return createType(this._node.objectType, this._context);
    }

    getIndexType(): ReflectedTypeNode {
        return createType(this._node.indexType, this._context);
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

        if (line != null && !isThirdParty(path)) {
            sourceRef.line = line;
            sourceRef.path = path;
        }

        tryAddProperty(tmpl, 'source', sourceRef);

        return tmpl;
    }
}
