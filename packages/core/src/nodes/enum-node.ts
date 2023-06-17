import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { DeclarationNode } from './declaration-node.js';
import { getLinePosition } from '../utils/get-location.js';
import type { EnumDeclaration } from '../models/enum.js';
import { EnumMemberNode } from './enum-member-node.js';
import type { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import type ts from 'typescript';


/**
 * The reflected node when an enumerable is found
 */
export class EnumNode implements DeclarationNode<EnumDeclaration, ts.EnumDeclaration> {

    private readonly _node: ts.EnumDeclaration;

    private readonly _context: AnalyzerContext;

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.EnumDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
        this._jsDoc = new JSDocNode(this._node);
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getKind(): DeclarationKind.Enum {
        return DeclarationKind.Enum;
    }

    getTSNode(): ts.EnumDeclaration {
        return this._node;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getName(): string {
        return this._node.name?.getText() ?? '';
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getNamespace(): string {
        return (this._node.parent?.parent as ts.ModuleDeclaration)?.name?.getText() ?? '';
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

            return new EnumMemberNode(member, value, this._context);
        });
    }

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
