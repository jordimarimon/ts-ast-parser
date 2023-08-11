import type { NamedParameterElement, Parameter } from '../models/parameter.js';
import { resolveExpression } from '../utils/resolve-expression.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition } from '../utils/get-location.js';
import type { ReflectedNode } from './reflected-node.js';
import { getDecorators } from '../utils/decorator.js';
import type { AnalyserContext } from '../context.js';
import { DecoratorNode } from './decorator-node.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { TypeNode } from './type-node.js';
import ts from 'typescript';


export class ParameterNode implements ReflectedNode<Parameter, ts.ParameterDeclaration> {

    private readonly _node: ts.ParameterDeclaration;

    private readonly _symbol: ts.Symbol | null;

    private readonly _context: AnalyserContext;

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.ParameterDeclaration, symbol: ts.Symbol | null, context: AnalyserContext) {
        this._node = node;
        this._symbol = symbol;
        this._context = context;
        this._jsDoc = new JSDocNode(this._node);
    }

    getName(): string {
        if (this.isNamed()) {
            return '__namedParameter';
        }

        if (this._symbol) {
            return this._symbol.getName() ?? '';
        }

        return this._node.name?.getText() ?? '';
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getTSNode(): ts.ParameterDeclaration {
        return this._node;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getType(): TypeNode {
        const jsDocType = ts.getJSDocType(this._node);
        const checker = this._context.checker;

        if (jsDocType) {
            return new TypeNode(jsDocType, null, this._context);
        }

        if (!this._symbol) {
            return TypeNode.fromNode(this._node, this._context);
        }

        const type = checker.getTypeOfSymbolAtLocation(this._symbol, this._node);

        return type ? TypeNode.fromType(type, this._context) : TypeNode.fromNode(this._node, this._context);
    }

    getDefault(): unknown {
        return resolveExpression(this._node.initializer, this._context.checker);
    }

    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    getNamedElements(): NamedParameterElement[] {
        if (!this.isNamed()) {
            return [];
        }

        const bindings = (this._node.name as ts.ObjectBindingPattern)?.elements ?? [];
        const result: NamedParameterElement[] = [];

        for (const binding of bindings) {
            result.push(this._createNamedParameterBinding(binding));
        }

        return result;
    }

    getJSDoc(): JSDocNode {
        return this._jsDoc;
    }

    isNamed(): boolean {
        return ts.isObjectBindingPattern(this._node.name);
    }

    isRest(): boolean {
        return !!(this._node.dotDotDotToken && this._node.type?.kind === ts.SyntaxKind.ArrayType);
    }

    isOptional(): boolean {
        return !!this._context.checker.isOptionalParameter(this._node);
    }

    serialize(): Parameter {
        const tmpl: Parameter = {
            name: this.getName(),
            type: this.getType().serialize(),
            line: this.getLine(),
        };

        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.serialize()));
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'optional', this.isOptional());
        tryAddProperty(tmpl, 'rest', this.isRest());
        tryAddProperty(tmpl, 'named', this.isNamed());
        tryAddProperty(tmpl, 'default', this.getDefault());
        tryAddProperty(tmpl, 'elements', this.getNamedElements());

        return tmpl;
    }

    private _createNamedParameterBinding(binding: ts.BindingElement): NamedParameterElement {
        const tmpl: NamedParameterElement = {
            name: binding.name?.getText() || '',
        };

        tryAddProperty(tmpl, 'default', resolveExpression(binding?.initializer, this._context.checker));

        return tmpl;
    }

}
