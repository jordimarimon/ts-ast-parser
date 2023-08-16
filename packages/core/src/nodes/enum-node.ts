import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { AnalyserContext } from '../analyser-context.js';
import type { DeclarationNode } from './declaration-node.js';
import type { EnumDeclaration } from '../models/enum.js';
import { EnumMemberNode } from './enum-member-node.js';
import { RootNodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import type ts from 'typescript';

/**
 * The reflected node when an enumerable is found
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

    getNodeType(): RootNodeType {
        return RootNodeType.Declaration;
    }

    getKind(): DeclarationKind.Enum {
        return DeclarationKind.Enum;
    }

    getTSNode(): ts.EnumDeclaration {
        return this._node;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    getNamespace(): string {
        if (!this._node.parent) {
            return '';
        }

        return (this._node.parent.parent as ts.ModuleDeclaration | undefined)?.name.getText() ?? '';
    }

    getJSDoc(): JSDocNode {
        return this._jsDoc;
    }

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
