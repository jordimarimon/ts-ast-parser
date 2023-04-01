import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition } from '../utils/get-location.js';
import { ReflectedNode } from './reflected-node.js';
import { EnumMember } from '../models/enum.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import ts from 'typescript';


export class EnumMemberNode implements ReflectedNode<EnumMember, ts.EnumMember> {

    private readonly _node: ts.EnumMember;

    private readonly _value: string | number;

    constructor(node: ts.EnumMember, value: string | number) {
        this._node = node;
        this._value = value;
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getValue(): string | number {
        return this._value;
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

    toPOJO(): EnumMember {
        const tmpl: EnumMember = {
            name: this.getName(),
            value: this.getValue(),
        };

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().toPOJO());

        return tmpl;
    }

}
