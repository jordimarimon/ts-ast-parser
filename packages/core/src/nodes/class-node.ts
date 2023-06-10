import { getInstanceMembers, getStaticMembers, isAbstract } from '../utils/member.js';
import { getExtendClauseReferences, isCustomElement } from '../utils/heritage.js';
import { isArrowFunction, isFunctionExpression } from '../utils/function.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { TypeParameterNode } from './type-parameter-node.js';
import type { DeclarationNode } from './declaration-node.js';
import { getLinePosition } from '../utils/get-location.js';
import type { ClassDeclaration } from '../models/class.js';
import type { Reference } from '../models/reference.js';
import type { SymbolWithContext } from '../utils/is.js';
import { getDecorators } from '../utils/decorator.js';
import type { AnalyzerContext } from '../context.js';
import { getNamespace } from '../utils/namespace.js';
import { SignatureNode } from './signature-node.js';
import { DecoratorNode } from './decorator-node.js';
import { ModifierType } from '../models/member.js';
import type { Method } from '../models/member.js';
import { FunctionNode } from './function-node.js';
import { PropertyNode } from './property-node.js';
import { isThirdParty } from '../utils/import.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import ts from 'typescript';


export class ClassNode implements DeclarationNode<ClassDeclaration, ts.ClassDeclaration | ts.VariableStatement> {

    private readonly _node: ts.ClassDeclaration | ts.VariableStatement;

    private readonly _context: AnalyzerContext;

    private readonly _instanceMembers: SymbolWithContext[] = [];

    private readonly _staticMembers: SymbolWithContext[] = [];

    constructor(node: ts.ClassDeclaration | ts.VariableStatement, context: AnalyzerContext) {
        this._node = node;
        this._context = context;

        const classNode = this._getClassNode();

        if (classNode) {
            this._instanceMembers = getInstanceMembers(classNode, this._context.checker);
            this._staticMembers = getStaticMembers(classNode, this._context.checker);
        }
    }

    getName(): string {
        if (ts.isVariableStatement(this._node)) {
            return this._node.declarationList.declarations?.[0]?.name?.getText() ?? '';
        }

        return this._node.name?.getText() ?? '';
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getKind(): DeclarationKind.Class {
        return DeclarationKind.Class;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getTSNode(): ts.ClassDeclaration | ts.VariableStatement {
        return this._node;
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    getDecoratorWithName(name: string): DecoratorNode | null {
        return this.getDecorators().find(d => d.getName() === name) ?? null;
    }

    getConstructors(): SignatureNode[] {
        const classNode = this._getClassNode();

        if (!classNode) {
            return [];
        }

        const checker = this._context.checker;
        const symbol = checker.getTypeAtLocation(classNode).getSymbol();
        const type = symbol && checker.getTypeOfSymbolAtLocation(symbol, classNode);
        const signatures = type?.getConstructSignatures() ?? [];
        const result: SignatureNode[] = [];

        for (const signature of signatures) {
            // If there is no declaration for the constructor, don't add it
            // to the list of constructors.
            if (!signature.getDeclaration()) {
                continue;
            }

            const node = new SignatureNode(signature, this._context);
            const path = node.getPath();

            if (path && !isThirdParty(path)) {
                result.push(node);
            }
        }

        return result;
    }

    getProperties(): PropertyNode[] {
        return this._getPropertyMembers(this._instanceMembers);
    }

    getStaticProperties(): PropertyNode[] {
        return this._getPropertyMembers(this._staticMembers);
    }

    getPropertyWithName(name: string): PropertyNode | null {
        return this.getProperties().find(m => m.getName() === name) ?? null;
    }

    getMethods(): FunctionNode[] {
        return this._getMethodMembers(this._instanceMembers);
    }

    getStaticMethods(): FunctionNode[] {
        return this._getMethodMembers(this._staticMembers);
    }

    getMethodWithName(name: string): FunctionNode | null {
        return this.getMethods().find(m => m.getName() === name) ?? null;
    }

    getTypeParameters(): TypeParameterNode[] {
        const classNode = this._getClassNode();

        if (!classNode) {
            return [];
        }

        return classNode.typeParameters?.map(tp => new TypeParameterNode(tp, this._context)) ?? [];
    }

    getHeritage(): readonly Reference[] {
        const classNode = this._getClassNode();

        if (!classNode) {
            return [];
        }

        return getExtendClauseReferences(classNode, this._context);
    }

    isCustomElement(): boolean {
        const classNode = this._getClassNode();

        if (!classNode) {
            return false;
        }

        return isCustomElement(classNode, this._context);
    }

    isAbstract(): boolean {
        const classNode = this._getClassNode();

        if (!classNode) {
            return false;
        }

        return isAbstract(classNode);
    }

    serialize(): ClassDeclaration {
        const tmpl: ClassDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
        };

        tryAddProperty(tmpl, 'constructors', this.getConstructors().map(c => c.serialize()));
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.serialize()));
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(tp => tp.serialize()));
        tryAddProperty(tmpl, 'heritage', this.getHeritage());
        tryAddProperty(tmpl, 'abstract', this.isAbstract());
        tryAddProperty(tmpl, 'customElement', this.isCustomElement());
        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'properties', this.getProperties().map(p => p.serialize()));
        tryAddProperty(tmpl, 'staticProperties', this.getStaticProperties().map(p => p.serialize()));
        tryAddProperty(tmpl, 'methods', this.getMethods().map(m => m.serialize()) as Method[]);
        tryAddProperty(tmpl, 'staticMethods', this.getStaticMethods().map(m => m.serialize()) as Method[]);

        return tmpl;
    }

    private _getPropertyMembers(members: SymbolWithContext[]): PropertyNode[] {
        const result: PropertyNode[] = [];

        for (const member of members) {
            const {symbol} = member;
            const decl = symbol?.getDeclarations()?.[0];

            if (!decl) {
                continue;
            }

            const isProperty = ts.isPropertyDeclaration(decl);
            const isPropertyMethod = ts.isMethodDeclaration(decl) ||
                (isProperty && (isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer)));

            if (isPropertyMethod) {
                continue;
            }

            if (isProperty || ts.isGetAccessor(decl) || ts.isSetAccessor(decl)) {
                const node = new PropertyNode(decl, member, this._context);

                if (node.getModifier() === ModifierType.public) {
                    result.push(node);
                }
            }
        }

        return result;
    }

    private _getMethodMembers(members: SymbolWithContext[]): FunctionNode[] {
        const result: FunctionNode[] = [];

        for (const member of members) {
            const {symbol} = member;
            const decl = symbol?.getDeclarations()?.[0];

            if (!decl) {
                continue;
            }

            const isProperty = ts.isPropertyDeclaration(decl);
            const isPropertyMethod = ts.isMethodDeclaration(decl) ||
                (isProperty && (isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer)));

            if (isPropertyMethod) {
                const node = new FunctionNode(decl, this._context, member);

                if (node.getModifier() === ModifierType.public) {
                    result.push(node);
                }
            }
        }

        return result;
    }

    private _getClassNode(): ts.ClassDeclaration | ts.ClassExpression | null {
        if (ts.isClassDeclaration(this._node)) {
            return this._node;
        }

        if (!ts.isVariableStatement(this._node)) {
            return null;
        }

        const decl = this._node.declarationList.declarations[0];
        const initializer = decl?.initializer;

        if (!initializer || !ts.isClassExpression(initializer)) {
            return null;
        }

        return initializer;
    }
}
