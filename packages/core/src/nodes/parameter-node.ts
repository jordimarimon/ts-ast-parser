import { getTypeFromNode, getTypeFromTSType } from '../utils/get-type.js';
import { NamedParameterElement, Parameter } from '../models/parameter.js';
import { resolveExpression } from '../utils/resolve-expression.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition } from '../utils/get-location.js';
import { getDecorators } from '../utils/decorator.js';
import { ReflectedNode } from './reflected-node.js';
import { DecoratorNode } from './decorator-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { Type } from '../models/type.js';
import ts from 'typescript';


export class ParameterNode implements ReflectedNode<Parameter, ts.ParameterDeclaration> {

    private readonly _node: ts.ParameterDeclaration;

    private readonly _symbol: ts.Symbol | null;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ParameterDeclaration, symbol: ts.Symbol | null, context: AnalyzerContext) {
        this._node = node;
        this._symbol = symbol;
        this._context = context;
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

    getContext(): AnalyzerContext {
        return this._context;
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getType(): Type {
        const jsDocType = this.getJSDoc().getTag(JSDocTagName.type)?.getValue<string>() ?? '';
        const checker = this._context.checker;

        if (jsDocType) {
            return {text: jsDocType};
        }

        if (!this._symbol) {
            return getTypeFromNode(this._node, this._context);
        }

        if (this.isNamed()) {
            const contextType = checker.typeToString(checker.getTypeOfSymbolAtLocation(this._symbol, this._node));
            const computedType = checker.typeToString(checker.getTypeAtLocation(this._node), this._node) || '';

            return {text: contextType ?? computedType};
        }

        const type = checker.getTypeOfSymbolAtLocation(this._symbol, this._node);

        return type
            ? getTypeFromTSType(type, this._context)
            : getTypeFromNode(this._node, this._context);
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
        return new JSDocNode(this._node);
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

    toPOJO(): Parameter {
        const tmpl: Parameter = {
            name: this.getName(),
            type: this.getType(),
            line: this.getLine(),
        };

        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.toPOJO()));
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().toPOJO());
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
