import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { AnalyserContext } from '../analyser-context.js';
import type { DeclarationNode } from './declaration-node.js';
import type { EnumDeclaration } from '../models/enum.js';
import { EnumMemberNode } from './enum-member-node.js';
import { getNamespace } from '../utils/namespace.js';
import { RootNodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of an enumerable declaration
 */
export class EnumNode implements DeclarationNode<EnumDeclaration, ts.EnumDeclaration> {

    private readonly _node: ts.EnumDeclaration;

    private readonly _context: AnalyserContext;

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.EnumDeclaration, context: AnalyserContext) {
        this._node = node;
        this._context = context;
        this._jsDoc = new JSDocNode(this._node);
    }

    /**
     * The reflected node kind
     */
    getNodeType(): RootNodeType {
        return RootNodeType.Declaration;
    }

    /**
     * The reflected declaration kind
     */
    getKind(): DeclarationKind.Enum {
        return DeclarationKind.Enum;
    }

    /**
     * The original TypeScript node
     */
    getTSNode(): ts.EnumDeclaration {
        return this._node;
    }

    /**
     * The analyser context
     */
    getContext(): AnalyserContext {
        return this._context;
    }

    /**
     * The name of the enum declaration
     */
    getName(): string {
        return this._node.name.getText() ?? '';
    }

    /**
     * The line position where the node is defined
     */
    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    /**
     * The namespace where the enum declaration is defined.
     * If there is no namespace, it will return an empty string.
     */
    getNamespace(): string {
        return getNamespace(this._node);
    }

    /**
     * The reflected documentation comment
     */
    getJSDoc(): JSDocNode {
        return this._jsDoc;
    }

    /**
     * The reflected members of the enum declaration
     */
    getMembers(): EnumMemberNode[] {
        let defaultInitializer = 0;

        return this._node.members.map(member => {
            let value: string | number = member.initializer?.getText() ?? '';

            if (value !== '') {
                const possibleNumericValue = parseInt(value);

                if (!isNaN(possibleNumericValue)) {
                    defaultInitializer = possibleNumericValue + 1;
                    value = possibleNumericValue;
                }
            } else {
                value = defaultInitializer++;
            }

            const callback = () => new EnumMemberNode(member, value, this._context);
            return this._context.registerReflectedNode(member, callback);
        });
    }

    /**
     * The reflected node as a serializable object
     */
    serialize(): EnumDeclaration {
        const tmpl: EnumDeclaration = {
            kind: this.getKind(),
            name: this.getName(),
            line: this.getLine(),
        };

        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'members', this.getMembers().map(member => member.serialize()));
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());

        return tmpl;
    }
}
