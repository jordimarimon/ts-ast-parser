import { DeclarationKind } from '../models/declaration-kind.js';
import { TypeAliasDeclaration } from '../models/type-alias.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { TypeParameterNode } from './type-parameter-node.js';
import { getLinePosition } from '../utils/get-location.js';
import { getNamespace } from '../utils/namespace.js';
import { ReflectedNode } from './reflected-node.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import ts from 'typescript';


export class TypeAliasNode implements ReflectedNode<TypeAliasDeclaration, ts.TypeAliasDeclaration> {

    private readonly _node: ts.TypeAliasDeclaration;

    constructor(node: ts.TypeAliasDeclaration) {
        this._node = node;
    }

    getTSNode(): ts.TypeAliasDeclaration {
        return this._node;
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getKind(): DeclarationKind.TypeAlias {
        return DeclarationKind.TypeAlias;
    }

    getName(): string {
        return this._node.name?.getText() ?? '';
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    getValue(): string {
        return this._node.type?.getText() ?? '';
    }

    getTypeParameters(): TypeParameterNode[] {
        return this._node.typeParameters?.map(tp => new TypeParameterNode(tp)) ?? [];
    }

    toPOJO(): TypeAliasDeclaration {
        const tmpl: TypeAliasDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
            value: this.getValue(),
        };

        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().toPOJO());
        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(tp => tp.toPOJO()));

        return tmpl;
    }

}
