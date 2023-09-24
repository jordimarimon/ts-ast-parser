import { ExpressionWithTypeArgumentsNode } from './expression-with-type-arguments-node.js';
import type { InterfaceDeclaration } from '../models/interface.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { IndexSignatureNode } from './index-signature-node.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import { TypeParameterNode } from './type-parameter-node.js';
import type { DeclarationNode } from './declaration-node.js';
import { getInstanceMembers } from '../utils/member.js';
import type { SymbolWithContext } from '../utils/is.js';
import { getNamespace } from '../utils/namespace.js';
import type { Method } from '../models/member.js';
import { PropertyNode } from './property-node.js';
import { FunctionNode } from './function-node.js';
import { RootNodeType } from '../models/node.js';
import { CommentNode } from './comment-node.js';
import ts from 'typescript';


/**
 * Represents the reflected node of an interface declaration
 */
export class InterfaceNode implements DeclarationNode<InterfaceDeclaration, ts.InterfaceDeclaration> {

    private readonly _node: ts.InterfaceDeclaration;

    private readonly _context: ProjectContext;

    private readonly _members: SymbolWithContext[] = [];

    private readonly _jsDoc: CommentNode;

    private readonly _heritage: ExpressionWithTypeArgumentsNode[] = [];

    constructor(node: ts.InterfaceDeclaration, context: ProjectContext) {
        this._node = node;
        this._context = context;
        this._members = getInstanceMembers(this._node, this._context);
        this._jsDoc = new CommentNode(this._node);
        this._heritage = (this._node.heritageClauses ?? []).flatMap(h => {
            return h.types.map(t => new ExpressionWithTypeArgumentsNode(t, this._context));
        });
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getNodeType(): RootNodeType {
        return RootNodeType.Declaration;
    }

    getKind(): DeclarationKind.Interface {
        return DeclarationKind.Interface;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTSNode(): ts.InterfaceDeclaration {
        return this._node;
    }

    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    getIndexSignature(): IndexSignatureNode | null {
        const checker = this._context.getTypeChecker();
        const indexSymbol = this._context.getSymbol(this._node)?.members?.get('__index' as ts.__String);
        const decl = indexSymbol?.getDeclarations()?.[0];

        if (!decl || !ts.isIndexSignatureDeclaration(decl)) {
            return null;
        }

        const symbolWithContext: SymbolWithContext = {
            symbol: indexSymbol,
            type: checker.getTypeOfSymbolAtLocation(indexSymbol, this._node),
        };

        const callback = () => new IndexSignatureNode(decl, symbolWithContext, this._context);
        return this._context.registerReflectedNode(decl, callback);
    }

    getProperties(): PropertyNode[] {
        const result: PropertyNode[] = [];

        for (const member of this._members) {
            const { symbol } = member;
            const decl = symbol?.getDeclarations()?.[0];

            if (!decl) {
                continue;
            }

            const isPropertyMethod =
                ts.isPropertySignature(decl) &&
                decl.type &&
                ts.isFunctionTypeNode(decl.type);

            if (
                (
                    ts.isPropertySignature(decl) ||
                    ts.isGetAccessor(decl) ||
                    ts.isSetAccessor(decl)
                ) && !isPropertyMethod
            ) {
                const reflectedNode = new PropertyNode(decl, member, this._context);
                result.push(reflectedNode);
            }
        }

        return result;
    }

    getPropertyWithName(name: string): PropertyNode | null {
        return this.getProperties().find(m => m.getName() === name) ?? null;
    }

    getMethods(): FunctionNode[] {
        const result: FunctionNode[] = [];

        for (const member of this._members) {
            const { symbol } = member;
            const decl = symbol?.getDeclarations()?.[0];

            if (!decl) {
                continue;
            }

            const isPropertyMethod =
                ts.isPropertySignature(decl) &&
                decl.type &&
                ts.isFunctionTypeNode(decl.type);

            if (ts.isMethodSignature(decl) || isPropertyMethod) {
                const reflectedNode = new FunctionNode(decl, member, this._context);
                result.push(reflectedNode);
            }
        }

        return result;
    }

    getMethodWithName(name: string): FunctionNode | null {
        return this.getMethods().find(m => m.getName() === name) ?? null;
    }

    getTypeParameters(): TypeParameterNode[] {
        return (this._node.typeParameters ?? []).map(tp => new TypeParameterNode(tp, this._context));
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): CommentNode {
        return this._jsDoc;
    }

    getHeritage(): ExpressionWithTypeArgumentsNode[] {
        return this._heritage;
    }

    /**
     * The reflected node as a serializable object
     */
    serialize(): InterfaceDeclaration {
        const tmpl: InterfaceDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
        };

        tryAddProperty(tmpl, 'heritage', this.getHeritage().map(h => h.serialize()));
        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(tp => tp.serialize()));
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'indexSignature', this.getIndexSignature()?.serialize());
        tryAddProperty(tmpl, 'properties', this.getProperties().map(p => p.serialize()));
        tryAddProperty(tmpl, 'methods', this.getMethods().map(m => m.serialize()) as Method[]);

        return tmpl;
    }
}
