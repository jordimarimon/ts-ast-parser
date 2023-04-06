import { tryAddProperty } from '../utils/try-add-property.js';
import { TypeParameter } from '../models/type-parameter.js';
import { getLinePosition } from '../utils/get-location.js';
import { ReflectedNode } from './reflected-node.js';
import { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


export class TypeParameterNode implements ReflectedNode<TypeParameter, ts.TypeParameterDeclaration> {

    private readonly _node: ts.TypeParameterDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.TypeParameterDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getTSNode(): ts.TypeParameterDeclaration {
        return this._node;
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getDefault(): string {
        return this._node.default?.getText() || '';
    }

    hasDefault(): boolean {
        return !!this.getDefault();
    }

    toPOJO(): TypeParameter {
        const tmpl: TypeParameter = {
            name: this.getName(),
        };

        tryAddProperty(tmpl, 'default', this.getDefault());

        return tmpl;
    }

}