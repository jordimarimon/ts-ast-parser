import { resolveExpression } from '../utils/resolve-expression.js';
import type { VariableDeclaration } from '../models/variable.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { DeclarationNode } from './declaration-node.js';
import { getLinePosition } from '../utils/get-location.js';
import { getDecorators } from '../utils/decorator.js';
import { getNamespace } from '../utils/namespace.js';
import type { AnalyserContext } from '../context.js';
import { DecoratorNode } from './decorator-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { TypeNode } from './type-node.js';
import type ts from 'typescript';


export class VariableNode implements DeclarationNode<VariableDeclaration, ts.VariableDeclaration> {

    private readonly _node: ts.VariableStatement;

    private readonly _declaration: ts.VariableDeclaration;

    private readonly _context: AnalyserContext;

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.VariableStatement, declaration: ts.VariableDeclaration, context: AnalyserContext) {
        this._node = node;
        this._declaration = declaration;
        this._context = context;
        this._jsDoc = new JSDocNode(this._node);
    }

    getContext(): AnalyserContext {
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

    getType(): TypeNode {
        return TypeNode.fromNode(this._node, this._context);
    }

    getValue(): unknown {
        const jsDocDefaultValue = this.getJSDoc().getTag(JSDocTagName.default)?.getValue<string>();

        return jsDocDefaultValue ?? resolveExpression(this._declaration.initializer, this._context.checker);
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): JSDocNode {
        return this._jsDoc;
    }

    serialize(): VariableDeclaration {
        const defaultValue = this.getValue();
        const tmpl: VariableDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
            type: this.getType().serialize(),
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
