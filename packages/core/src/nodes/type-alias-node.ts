import type { TypeAliasDeclaration } from '../models/type-alias.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { AnalyserContext } from '../analyser-context.js';
import { TypeParameterNode } from './type-parameter-node.js';
import type { DeclarationNode } from './declaration-node.js';
import { createType } from '../factories/create-type.js';
import type { ReflectedNode } from '../reflected-node.js';
import { getNamespace } from '../utils/namespace.js';
import { RootNodeType } from '../models/node.js';
import type { Type } from '../models/type.js';
import { JSDocNode } from './jsdoc-node.js';
import type ts from 'typescript';


export class TypeAliasNode implements DeclarationNode<TypeAliasDeclaration, ts.TypeAliasDeclaration> {

    private readonly _node: ts.TypeAliasDeclaration;

    private readonly _context: AnalyserContext;

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.TypeAliasDeclaration, context: AnalyserContext) {
        this._node = node;
        this._context = context;
        this._jsDoc = new JSDocNode(this._node);
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.TypeAliasDeclaration {
        return this._node;
    }

    getNodeType(): RootNodeType {
        return RootNodeType.Declaration;
    }

    getKind(): DeclarationKind.TypeAlias {
        return DeclarationKind.TypeAlias;
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): JSDocNode {
        return this._jsDoc;
    }

    getValue(): ReflectedNode<Type> {
        return createType(this._node.type, this._context);
    }

    getTypeParameters(): TypeParameterNode[] {
        return this._node.typeParameters?.map(tp => new TypeParameterNode(tp, this._context)) ?? [];
    }

    /**
     * The reflected node as a serializable object
     */
    serialize(): TypeAliasDeclaration {
        const tmpl: TypeAliasDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
            value: this.getValue().serialize(),
        };

        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(tp => tp.serialize()));

        return tmpl;
    }
}
