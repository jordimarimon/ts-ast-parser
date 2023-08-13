import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedTypeNode } from '../reflected-node.js';
import type { SourceReference } from '../models/reference.js';
import { createType } from '../factories/create-type.js';
import { getLocation } from '../utils/get-location.js';
import type { AnalyserContext } from '../context.js';
import { isThirdParty } from '../utils/import.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';

export class TypeQueryNode implements ReflectedTypeNode<ts.TypeQueryNode> {
    private readonly _node: ts.TypeQueryNode;

    private readonly _type: ts.Type;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypeQueryNode, type: ts.Type, context: AnalyserContext) {
        this._node = node;
        this._type = type;
        this._context = context;
    }

    getContext(): AnalyserContext {
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
        return getLocation(this._node.exprName, this._context).path;
    }

    getLine(): number | null {
        return getLocation(this._node.exprName, this._context).line;
    }

    getText(): string {
        return this._context.checker.typeToString(this._type);
    }

    getElementType(): ReflectedTypeNode {
        const checker = this._context.checker;
        const exprName = this._node.exprName;
        const tsType = checker.getTypeAtLocation(exprName);

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
