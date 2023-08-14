import type { AnalyserContext } from '../analyser-context.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedNode } from '../reflected-node.js';
import type { EnumMember } from '../models/enum.js';
import { JSDocNode } from './jsdoc-node.js';
import type ts from 'typescript';


export class EnumMemberNode implements ReflectedNode<EnumMember, ts.EnumMember> {

    private readonly _node: ts.EnumMember;

    private readonly _value: string | number;

    private readonly _context: AnalyserContext;

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.EnumMember, value: string | number, context: AnalyserContext) {
        this._node = node;
        this._value = value;
        this._context = context;
        this._jsDoc = new JSDocNode(node);
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getValue(): string | number {
        return this._value;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getLine(): number {
        return this._context.getLinePosition(this._node);
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
