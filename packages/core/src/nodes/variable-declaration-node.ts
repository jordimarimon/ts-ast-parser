import { resolveExpression } from '../utils/resolve-expression.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { VariableDeclaration } from '../models/variable.js';
import { getLinePosition } from '../utils/get-location.js';
import { getTypeInfoFromNode } from '../utils/get-type.js';
import { DeclarationNode } from './declaration-node.js';
import { getDecorators } from '../utils/decorator.js';
import { DecoratorNode } from './decorator-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { Type } from '../models/type.js';
import ts from 'typescript';


export class VariableDeclarationNode implements DeclarationNode<VariableDeclaration, ts.VariableDeclaration> {

    private readonly _node: ts.VariableStatement;

    private readonly _declaration: ts.VariableDeclaration;

    constructor(node: ts.VariableStatement, declaration: ts.VariableDeclaration) {
        this._node = node;
        this._declaration = declaration;
    }

    getName(): string {
        return this._declaration.name.getText() ?? '';
    }

    getTSNode(): ts.VariableDeclaration {
        return this._declaration;
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getKind(): DeclarationKind.variable {
        return DeclarationKind.variable;
    }

    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d));
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getType(): Type {
        const jsDocType = this.getJSDoc().getJSDocTag(JSDocTagName.type)?.getValue<string>() ?? '';

        return jsDocType ? {text: jsDocType} : getTypeInfoFromNode(this._declaration);
    }

    getDefault(): unknown {
        const jsDocDefaultValue = this.getJSDoc().getJSDocTag(JSDocTagName.default)?.getValue<string>();

        return jsDocDefaultValue ?? resolveExpression(this._declaration.initializer);
    }

    getNamespace(): string {
        return (this._node.parent?.parent as ts.ModuleDeclaration)?.name?.getText() ?? '';
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    hasDefault(): boolean {
        return this.getDefault() !== undefined;
    }

    toPOJO(): VariableDeclaration {
        const defaultValue = this.getDefault();
        const tmpl: VariableDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
            type: this.getType(),
        };

        if (defaultValue !== '') {
            tmpl.default = defaultValue;
        }

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().toPOJO());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.toPOJO()));
        tryAddProperty(tmpl, 'namespace', this.getNamespace());

        return tmpl;
    }

}
