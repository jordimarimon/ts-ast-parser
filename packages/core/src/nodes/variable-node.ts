import { resolveExpression } from '../utils/resolve-expression.js';
import type { VariableDeclaration } from '../models/variable.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { DeclarationNode } from './declaration-node.js';
import { getLinePosition } from '../utils/get-location.js';
import { getTypeFromNode } from '../utils/get-type.js';
import { getDecorators } from '../utils/decorator.js';
import { getNamespace } from '../utils/namespace.js';
import type { AnalyzerContext } from '../context.js';
import { DecoratorNode } from './decorator-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import type { Type } from '../models/type.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import type ts from 'typescript';


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
        const jsDocType = this.getJSDoc().getTag(JSDocTagName.type)?.getValue<string>() ?? '';

        return jsDocType
            ? {text: jsDocType}
            : getTypeFromNode(this._declaration, this._context);
    }

    getValue(): unknown {
        const jsDocDefaultValue = this.getJSDoc().getTag(JSDocTagName.default)?.getValue<string>();

        return jsDocDefaultValue ?? resolveExpression(this._declaration.initializer, this._context.checker);
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    serialize(): VariableDeclaration {
        const defaultValue = this.getValue();
        const tmpl: VariableDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
            type: this.getType(),
        };

        if (defaultValue !== '') {
            tmpl.default = defaultValue;
        }

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.serialize()));
        tryAddProperty(tmpl, 'namespace', this.getNamespace());

        return tmpl;
    }

}
