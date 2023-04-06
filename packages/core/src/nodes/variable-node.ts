import { resolveExpression } from '../utils/resolve-expression.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { VariableDeclaration } from '../models/variable.js';
import { getLinePosition } from '../utils/get-location.js';
import { getTypeFromNode } from '../utils/get-type.js';
import { DeclarationNode } from './declaration-node.js';
import { getDecorators } from '../utils/decorator.js';
import { getNamespace } from '../utils/namespace.js';
import { DecoratorNode } from './decorator-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { Type } from '../models/type.js';
import ts from 'typescript';


export class VariableNode implements DeclarationNode<VariableDeclaration, ts.VariableDeclaration> {

    private readonly _node: ts.VariableStatement;

    private readonly _declaration: ts.VariableDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.VariableStatement, declaration: ts.VariableDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._declaration = declaration;
        this._context = context;
    }

    getContext(): AnalyzerContext {
        return this._context;
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

    getKind(): DeclarationKind.Variable {
        return DeclarationKind.Variable;
    }

    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getType(): Type {
        const jsDocType = this.getJSDoc().getJSDocTag(JSDocTagName.type)?.getValue<string>() ?? '';

        return jsDocType
            ? {text: jsDocType}
            : getTypeFromNode(this._declaration, this._context);
    }

    getDefault(): unknown {
        const jsDocDefaultValue = this.getJSDoc().getJSDocTag(JSDocTagName.default)?.getValue<string>();

        return jsDocDefaultValue ?? resolveExpression(this._declaration.initializer, this._context.checker);
    }

    getNamespace(): string {
        return getNamespace(this._node);
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
