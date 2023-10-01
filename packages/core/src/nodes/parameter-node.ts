import { createType, createTypeFromDeclaration } from '../factories/create-type.js';
import { resolveExpression } from '../utils/resolve-expression.js';
import { BindingElementNode } from './binding-element-node.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import type { ReflectedNode } from '../reflected-node.js';
import type { Parameter } from '../models/parameter.js';
import { getDecorators } from '../utils/decorator.js';
import { DecoratorNode } from './decorator-node.js';
import type { Type } from '../models/type.js';
import { CommentNode } from './comment-node.js';
import ts from 'typescript';


/**
 * Represents the reflected node of a parameter declaration
 */
export class ParameterNode implements ReflectedNode<Parameter, ts.ParameterDeclaration> {

    private readonly _node: ts.ParameterDeclaration;

    private readonly _symbol: ts.Symbol | null;

    private readonly _context: ProjectContext;

    private readonly _jsDoc: CommentNode;

    constructor(node: ts.ParameterDeclaration, symbol: ts.Symbol | null, context: ProjectContext) {
        this._node = node;
        this._symbol = symbol;
        this._context = context;
        this._jsDoc = new CommentNode(this._node);
    }

    getName(): string {
        if (this.isNamed()) {
            return '__namedParameter';
        }

        if (this._symbol) {
            return this._symbol.getName() ?? '';
        }

        return this._node.name.getText() ?? '';
    }

    getTSNode(): ts.ParameterDeclaration {
        return this._node;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    getType(): ReflectedNode<Type> {
        const checker = this._context.getTypeChecker();
        const type = this._symbol ? checker.getTypeOfSymbolAtLocation(this._symbol, this._node) : null;

        return type ? createType(type, this._context) : createTypeFromDeclaration(this._node, this._context);
    }

    getDefault(): unknown {
        return resolveExpression(this._node.initializer, this._context);
    }

    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    getNamedElements(): BindingElementNode[] {
        if (!this.isNamed()) {
            return [];
        }

        const bindings = (this._node.name as ts.ObjectBindingPattern).elements ?? [];
        const result: BindingElementNode[] = [];

        for (const binding of bindings) {
            result.push(new BindingElementNode(binding, this._context));
        }

        return result;
    }

    getJSDoc(): CommentNode {
        return this._jsDoc;
    }

    isNamed(): boolean {
        return ts.isObjectBindingPattern(this._node.name);
    }

    isRest(): boolean {
        return !!(this._node.dotDotDotToken && this._node.type?.kind === ts.SyntaxKind.ArrayType);
    }

    isOptional(): boolean {
        return !!this._context.getTypeChecker().isOptionalParameter(this._node);
    }

    /**
     * Serializes the reflected node
     *
     * @returns The reflected node as a serializable object
     */
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
        tryAddProperty(tmpl, 'elements', this.getNamedElements().map(e => e.serialize()));

        return tmpl;
    }
}
