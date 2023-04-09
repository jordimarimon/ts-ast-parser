import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition } from '../utils/get-location.js';
import { ReflectedNode } from './reflected-node.js';
import { AnalyzerContext } from '../context.js';
import { EnumMember } from '../models/enum.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import ts from 'typescript';


export class EnumMemberNode implements ReflectedNode<EnumMember, ts.EnumMember> {

    private readonly _node: ts.EnumMember;

    private readonly _value: string | number;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.EnumMember, value: string | number, context: AnalyzerContext) {
        this._node = node;
        this._value = value;
        this._context = context;
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getValue(): string | number {
        return this._value;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getTSNode(): ts.EnumMember {
        return this._node;
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    serialize(): EnumMember {
        const tmpl: EnumMember = {
            name: this.getName(),
            value: this.getValue(),
        };

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());

        return tmpl;
    }

}
