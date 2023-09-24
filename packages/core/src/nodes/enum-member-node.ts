import type { ProjectContext } from '../project-context.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedNode } from '../reflected-node.js';
import type { EnumMember } from '../models/enum.js';
import { CommentNode } from './comment-node.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of an enum member
 */
export class EnumMemberNode implements ReflectedNode<EnumMember, ts.EnumMember> {

    private readonly _node: ts.EnumMember;

    private readonly _value: string | number;

    private readonly _context: ProjectContext;

    private readonly _jsDoc: CommentNode;

    constructor(node: ts.EnumMember, value: string | number, context: ProjectContext) {
        this._node = node;
        this._value = value;
        this._context = context;
        this._jsDoc = new CommentNode(node);
    }

    /**
     * The name of the enum member
     */
    getName(): string {
        return this._node.name.getText() ?? '';
    }

    /**
     * The value of the enum member
     */
    getValue(): string | number {
        return this._value;
    }

    /**
     * The analyser context
     */
    getContext(): ProjectContext {
        return this._context;
    }

    /**
     * The line position where the enum member is defined
     */
    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    /**
     * The original TypeScript node
     */
    getTSNode(): ts.EnumMember {
        return this._node;
    }

    /**
     * The reflected documentation comment
     */
    getJSDoc(): CommentNode {
        return this._jsDoc;
    }

    /**
     * The reflected node as a serializable object
     */
    serialize(): EnumMember {
        const tmpl: EnumMember = {
            name: this.getName(),
            value: this.getValue(),
        };

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());

        return tmpl;
    }
}
