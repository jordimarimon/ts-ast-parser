import { ExpressionWithTypeArgumentsNode } from './expression-with-type-arguments-node.js';
import { getInstanceMembers, getStaticMembers, isAbstract } from '../utils/member.js';
import { isArrowFunction, isFunctionExpression } from '../utils/function.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { AnalyserContext } from '../analyser-context.js';
import type { DeclarationNode } from './declaration-node.js';
import { TypeParameterNode } from './type-parameter-node.js';
import type { ClassDeclaration } from '../models/class.js';
import type { SymbolWithContext } from '../utils/is.js';
import { isCustomElement } from '../utils/heritage.js';
import { getDecorators } from '../utils/decorator.js';
import { getNamespace } from '../utils/namespace.js';
import { SignatureNode } from './signature-node.js';
import { DecoratorNode } from './decorator-node.js';
import type { Method } from '../models/member.js';
import { ModifierType } from '../models/member.js';
import { FunctionNode } from './function-node.js';
import { PropertyNode } from './property-node.js';
import { isThirdParty } from '../utils/import.js';
import { RootNodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import ts from 'typescript';


/**
 * Reflected node that represents a ClassDeclaration or a ClassExpression
 */
export class ClassNode implements DeclarationNode<ClassDeclaration, ts.ClassDeclaration | ts.VariableStatement> {

    private readonly _node: ts.ClassDeclaration | ts.VariableStatement;

    private readonly _context: AnalyserContext;

    private readonly _instanceMembers: SymbolWithContext[] = [];

    private readonly _staticMembers: SymbolWithContext[] = [];

    private readonly _heritage: ExpressionWithTypeArgumentsNode[] = [];

    private readonly _jsDoc: JSDocNode;

    constructor(node: ts.ClassDeclaration | ts.VariableStatement, context: AnalyserContext) {
        this._node = node;
        this._context = context;
        this._jsDoc = new JSDocNode(node);

        const classNode = this._getClassNode();

        if (classNode) {
            this._instanceMembers = getInstanceMembers(classNode, this._context);
            this._staticMembers = getStaticMembers(classNode, this._context);
            this._heritage = (classNode.heritageClauses ?? []).flatMap(h => {
                return h.types.map(t => new ExpressionWithTypeArgumentsNode(t, this._context));
            });
        }
    }

    /**
     * Returns the name of the class
     */
    getName(): string {
        if (ts.isVariableStatement(this._node)) {
            return this._node.declarationList.declarations?.[0]?.name?.getText() ?? '';
        }

        return this._node.name?.getText() ?? '';
    }

    /**
     * The type of node inside the module
     */
    getNodeType(): RootNodeType {
        return RootNodeType.Declaration;
    }

    /**
     * The type of declaration
     */
    getKind(): DeclarationKind.Class {
        return DeclarationKind.Class;
    }

    /**
     * The analyzer context
     */
    getContext(): AnalyserContext {
        return this._context;
    }

    /**
     * The internal TypeScript node
     */
    getTSNode(): ts.ClassDeclaration | ts.VariableStatement {
        return this._node;
    }

    /**
     * The start line number position
     */
    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    /**
     * The namespace where the class has been defined
     */
    getNamespace(): string {
        return getNamespace(this._node);
    }

    /**
     * The JSDoc comments
     */
    getJSDoc(): JSDocNode {
        return this._jsDoc;
    }

    /**
     * An array of decorators applied to the class
     */
    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    /**
     * Finds a decorator based on the name
     *
     * @param name - The decorator name to find
     */
    getDecoratorWithName(name: string): DecoratorNode | null {
        return this.getDecorators().find(d => d.getName() === name) ?? null;
    }

    /**
     * An array of constructors that can be used to create an instance of the class
     */
    getConstructors(): SignatureNode[] {
        const classNode = this._getClassNode();

        if (!classNode) {
            return [];
        }

        const checker = this._context.getTypeChecker();
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

    /**
     * The instance properties
     */
    getProperties(): PropertyNode[] {
        return this._getPropertyMembers(this._instanceMembers);
    }

    /**
     * The static properties
     */
    getStaticProperties(): PropertyNode[] {
        return this._getPropertyMembers(this._staticMembers);
    }

    /**
     * Finds an instance property based on the name
     *
     * @param name - The property name to find
     */
    getPropertyWithName(name: string): PropertyNode | null {
        return this.getProperties().find(m => m.getName() === name) ?? null;
    }

    /**
     * The instance methods
     */
    getMethods(): FunctionNode[] {
        return this._getMethodMembers(this._instanceMembers);
    }

    /**
     * The static methods
     */
    getStaticMethods(): FunctionNode[] {
        return this._getMethodMembers(this._staticMembers);
    }

    /**
     * Finds an instance method based on the name
     *
     * @param name - The name of the method to find
     */
    getMethodWithName(name: string): FunctionNode | null {
        return this.getMethods().find(m => m.getName() === name) ?? null;
    }

    /**
     * The type parameters
     */
    getTypeParameters(): TypeParameterNode[] {
        const classNode = this._getClassNode();

        if (!classNode) {
            return [];
        }

        return classNode.typeParameters?.map(tp => new TypeParameterNode(tp, this._context)) ?? [];
    }

    /**
     * The heritage chain
     */
    getHeritage(): ExpressionWithTypeArgumentsNode[] {
        return this._heritage;
    }

    /**
     * Whether is a custom element or not
     */
    isCustomElement(): boolean {
        const classNode = this._getClassNode();

        if (!classNode) {
            return false;
        }

        return isCustomElement(classNode, this._context);
    }

    /**
     * Whether it's abstract or not
     */
    isAbstract(): boolean {
        const classNode = this._getClassNode();

        if (!classNode) {
            return false;
        }

        return isAbstract(classNode);
    }

    /**
     * Generates a simple JS object with read-only properties representing the node
     */
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
        tryAddProperty(tmpl, 'heritage', this.getHeritage().map(h => h.serialize()));
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
            const { symbol } = member;
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
                const callback = () => new PropertyNode(decl, member, this._context);
                const reflectedNode = this._context.registerReflectedNode(decl, callback);

                if (reflectedNode.getModifier() === ModifierType.public) {
                    result.push(reflectedNode);
                }
            }
        }

        return result;
    }

    private _getMethodMembers(members: SymbolWithContext[]): FunctionNode[] {
        const result: FunctionNode[] = [];

        for (const member of members) {
            const { symbol } = member;
            const decl = symbol?.getDeclarations()?.[0];

            if (!decl) {
                continue;
            }

            const isProperty = ts.isPropertyDeclaration(decl);
            const isPropertyMethod = ts.isMethodDeclaration(decl) ||
                (isProperty && (isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer)));

            if (isPropertyMethod) {
                const callback = () => new FunctionNode(decl, member, this._context);
                const reflectedNode = this._context.registerReflectedNode(decl, callback);

                if (reflectedNode.getModifier() === ModifierType.public) {
                    result.push(reflectedNode);
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
