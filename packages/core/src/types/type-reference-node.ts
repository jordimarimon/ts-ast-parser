import type { SourceReference } from '../models/reference.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedTypeNode } from '../reflected-node.js';
import { createType } from '../factories/create-type.js';
import { getLocation } from '../utils/get-location.js';
import type { AnalyserContext } from '../context.js';
import { isThirdParty } from '../utils/import.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import ts from 'typescript';

export class TypeReferenceNode implements ReflectedTypeNode<ts.TypeReferenceNode> {
    private readonly _node: ts.TypeReferenceNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypeReferenceNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
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
            return this._context.checker.typeToString(this._type);
        }

        const refName = ts.isIdentifier(this._node.typeName)
            ? this._node.typeName.text
            : this._node.typeName.right.text;

        const args = this.getTypeArguments().map(t => t.getText());

        return args.length > 0 ? `${refName}<${args.join(', ')}>` : refName;
    }

    getPath(): string {
        return getLocation(this._node.typeName, this._context).path;
    }

    getLine(): number | null {
        return getLocation(this._node.typeName, this._context).line;
    }

    getReferenceType(): ReflectedTypeNode {
        const checker = this._context.checker;
        const referenceName = this._node.typeName;
        const tsType = checker.getTypeAtLocation(referenceName);

        return createType(tsType, this._context);
    }

    getTypeArguments(): ReflectedTypeNode[] {
        return (this._node.typeArguments ?? []).map(t => createType(t, this._context));
    }

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
        tryAddProperty(
            tmpl,
            'typeArguments',
            this.getTypeArguments().map(t => t.serialize()),
        );

        return tmpl;
    }
}
