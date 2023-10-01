import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import type { DeclarationNode } from './declaration-node.js';
import type { EnumDeclaration } from '../models/enum.js';
import { EnumMemberNode } from './enum-member-node.js';
import { getNamespace } from '../utils/namespace.js';
import { RootNodeType } from '../models/node.js';
import { CommentNode } from './comment-node.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of an enumerable declaration
 */
export class EnumNode implements DeclarationNode<EnumDeclaration, ts.EnumDeclaration> {

    private readonly _node: ts.EnumDeclaration;

    private readonly _context: ProjectContext;

    private readonly _jsDoc: CommentNode;

    constructor(node: ts.EnumDeclaration, context: ProjectContext) {
        this._node = node;
        this._context = context;
        this._jsDoc = new CommentNode(this._node);
    }

    /**
     * The reflected node kind
     *
     * @returns A declaration kind node
     */
    getNodeType(): RootNodeType {
        return RootNodeType.Declaration;
    }

    /**
     * The reflected declaration kind
     *
     * @returns An Enum kind node
     */
    getKind(): DeclarationKind.Enum {
        return DeclarationKind.Enum;
    }

    /**
     * The original TypeScript node
     *
     * @returns The TypeScript AST node related to this reflected node
     */
    getTSNode(): ts.EnumDeclaration {
        return this._node;
    }

    /**
     * The context includes useful APIs that are shared across
     * all the reflected symbols.
     *
     * Some APIs include the parsed configuration options, the
     * system interface, the type checker
     *
     * @returns The analyser context
     */
    getContext(): ProjectContext {
        return this._context;
    }

    /**
     * Gets the name of the enum declaration
     *
     * @returns The name of the enum declaration
     */
    getName(): string {
        return this._node.name.getText() ?? '';
    }

    /**
     * The line position where the node is defined
     *
     * @returns The start line position number
     */
    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    /**
     * The namespace where the enum declaration is defined.
     *
     * @returns The namespace name if found one, otherwise an empty string
     */
    getNamespace(): string {
        return getNamespace(this._node);
    }

    /**
     * The reflected documentation comment
     *
     * @returns The JSDoc node
     */
    getJSDoc(): CommentNode {
        return this._jsDoc;
    }

    /**
     * The reflected members of the enum declaration
     *
     * @returns The array of reflected enum members
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
     * Serializes the reflected node
     *
     * @returns The reflected node as a serializable object
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
