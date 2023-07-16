import type { TypeParameter } from '../models/type-parameter.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { getTypeArgumentNames } from '../utils/heritage.js';
import { getLinePosition } from '../utils/get-location.js';
import type { ReflectedNode } from './reflected-node.js';
import type { AnalyserContext } from '../context.js';
import { NodeType } from '../models/node.js';
import type ts from 'typescript';


export class TypeParameterNode implements ReflectedNode<TypeParameter, ts.TypeParameterDeclaration> {

    private readonly _node: ts.TypeParameterDeclaration;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypeParameterDeclaration, context: AnalyserContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): AnalyserContext {
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

    getConstraint(): string {
        if (!this._node.constraint) {
            return '';
        }

        return getTypeArgumentNames([this._node.constraint])[0] ?? '';
    }

    hasDefault(): boolean {
        return !!this.getDefault();
    }

    serialize(): TypeParameter {
        const tmpl: TypeParameter = {
            name: this.getName(),
        };

        tryAddProperty(tmpl, 'default', this.getDefault());
        tryAddProperty(tmpl, 'constraint', this.getConstraint());

        return tmpl;
    }

}
