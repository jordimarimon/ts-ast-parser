import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition } from '../utils/get-location.js';
import type { ReflectedNode } from './reflected-node.js';
import type { AnalyzerContext } from '../context.js';
import type { EnumMember } from '../models/enum.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import type ts from 'typescript';


export class EnumMemberNode implements ReflectedNode<EnumMember, ts.EnumMember> {

    private readonly _node: ts.EnumMember;

    private readonly _value: string | number;

    private readonly _context: AnalyzerContext;

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.EnumMember, value: string | number, context: AnalyzerContext) {
        this._node = node;
        this._value = value;
        this._context = context;
        this._jsDoc = new JSDocNode(node);
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
        return this._jsDoc;
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
