import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import { TypeParameterNode } from './type-parameter-node.js';
import type { ClassDeclaration } from '../models/class.js';
import { getDecorators } from '../utils/decorator.js';
import { SignatureNode } from './signature-node.js';
import { DecoratorNode } from './decorator-node.js';
import type { Method } from '../models/member.js';
import { ModifierType } from '../models/member.js';
import { FunctionNode } from './function-node.js';
import { PropertyNode } from './property-node.js';
import { isThirdParty } from '../utils/import.js';
import { CommentNode } from './comment-node.js';
import { isAbstract } from '../utils/modifiers.js';
import ts from 'typescript';
import type { ReflectedNode } from '../reflected-node.js';
import { ClassOrInterfaceNode, type SymbolWithContext } from './class-or-interface-node.js';
import { DeclarationKind } from '../models/declaration.js';
import { HeritageClauseNode } from './heritage-clause-node.js';


type ClassLike = ts.ClassDeclaration | ts.ClassExpression | ts.VariableStatement;

/**
 * Reflected node that represents a ClassDeclaration or a ClassExpression
 */
export class ClassNode extends ClassOrInterfaceNode implements ReflectedNode<ClassDeclaration, ClassLike> {

    private readonly _node: ClassLike;

    private readonly _context: ProjectContext;

    private readonly _instanceMembers: SymbolWithContext[] = [];

    private readonly _staticMembers: SymbolWithContext[] = [];

    private readonly _heritage: HeritageClauseNode[] = [];

    private readonly _jsDoc: CommentNode;

    constructor(node: ClassLike, context: ProjectContext) {
        super();

        this._node = node;
        this._context = context;
        this._jsDoc = new CommentNode(node, context);

        const classNode = this._getClassNode();

        if (classNode) {
            this._instanceMembers = this._getInstanceMembers(classNode, this._context);
            this._staticMembers = this._getStaticMembers(classNode, this._context);
            this._heritage = (classNode.heritageClauses ?? []).map(h => {
                return new HeritageClauseNode(h, context);
            });
        }
    }

    /**
     * The name of the class.
     *
     * If it's a class expression that it's assigned to a variable, it will return
     * the name of the variable
     *
     * @returns The name of the class
     */
    getName(): string {
        if (ts.isVariableStatement(this._node)) {
            return this._node.declarationList.declarations[0]?.name.getText() ?? '';
        }

        return this._node.name?.getText() ?? '';
    }

    /**
     * The reflected declaration kind
     *
     * @returns The class declaration kind
     */
    getKind(): DeclarationKind.Class {
        return DeclarationKind.Class;
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
     * The internal TypeScript node
     *
     * @returns The TypeScript AST node related to this reflected node
     */
    getTsNode(): ts.ClassDeclaration | ts.ClassExpression | ts.VariableStatement {
        return this._node;
    }

    /**
     * The start line number position
     *
     * @returns The start line number position
     */
    getLine(): number {
        return this._context.getLinePosition(this._node);
    }

    /**
     * The reflected JSDoc comment node
     *
     * @returns The JSDoc node
     */
    getJSDoc(): CommentNode {
        return this._jsDoc;
    }

    /**
     * The reflected decorators applied to the class
     *
     * @returns An array of reflected decorators
     */
    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    /**
     * Finds a reflected decorator based on the name
     *
     * @param name - The decorator name to find
     *
     * @returns The reflected decorator that matches the given name
     */
    getDecoratorWithName(name: string): DecoratorNode | null {
        return this.getDecorators().find(d => d.getName() === name) ?? null;
    }

    /**
     * An array of constructors that can be used to
     * create an instance of the class
     *
     * @returns All the constructor signatures
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
     *
     * @returns All the reflected instance properties
     */
    getProperties(): PropertyNode[] {
        return this._getPropertyMembers(this._instanceMembers);
    }

    /**
     * The static properties
     *
     * @returns All the reflected static properties
     */
    getStaticProperties(): PropertyNode[] {
        return this._getPropertyMembers(this._staticMembers);
    }

    /**
     * Finds an instance property based on the name
     *
     * @param name - The property name to find
     *
     * @returns The reflected instance property that matches the given name
     */
    getPropertyWithName(name: string): PropertyNode | null {
        return this.getProperties().find(m => m.getName() === name) ?? null;
    }

    /**
     * The instance methods
     *
     * @returns All the reflected instance methods
     */
    getMethods(): FunctionNode[] {
        return this._getMethodMembers(this._instanceMembers);
    }

    /**
     * The static methods
     *
     * @returns All the reflected static methods
     */
    getStaticMethods(): FunctionNode[] {
        return this._getMethodMembers(this._staticMembers);
    }

    /**
     * Finds an instance method based on the name
     *
     * @param name - The name of the method to find
     *
     * @returns The reflected instance method that matches the given name
     */
    getMethodWithName(name: string): FunctionNode | null {
        return this.getMethods().find(m => m.getName() === name) ?? null;
    }

    /**
     * The type parameters
     *
     * @returns All the reflected type parameters
     */
    getTypeParameters(): TypeParameterNode[] {
        const classNode = this._getClassNode();

        if (!classNode) {
            return [];
        }

        return classNode.typeParameters?.map(tp => new TypeParameterNode(tp, this._context)) ?? [];
    }

    /**
     * The heritage chain. Interfaces that the class implements or
     * parent classes that it extends.
     *
     * @returns The heritage chain
     */
    getHeritage(): HeritageClauseNode[] {
        return this._heritage;
    }

    /**
     * Whether is a custom element or not
     *
     * @returns True if the class declaration is a custom element, otherwise false
     */
    isCustomElement(): boolean {
        const classNode = this._getClassNode();

        if (!classNode) {
            return false;
        }

        return this._isCustomElement(classNode, this._context);
    }

    /**
     * Whether it's an abstract class or not
     *
     * @returns True if it's an abstract class, otherwise false
     */
    isAbstract(): boolean {
        const classNode = this._getClassNode();

        if (!classNode) {
            return false;
        }

        return isAbstract(classNode);
    }

    /**
     * Serializes the reflected node
     *
     * @returns The reflected node as a serializable object
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
                (isProperty && decl.initializer &&
                    (ts.isArrowFunction(decl.initializer) ||
                        ts.isFunctionExpression(decl.initializer)));

            if (isPropertyMethod) {
                continue;
            }

            if (isProperty || ts.isGetAccessor(decl) || ts.isSetAccessor(decl)) {
                const reflectedNode = new PropertyNode(decl, member, this._context);

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
                (isProperty && decl.initializer &&
                    (ts.isArrowFunction(decl.initializer) ||
                        ts.isFunctionExpression(decl.initializer)));

            if (isPropertyMethod) {
                const reflectedNode = new FunctionNode(decl, member, this._context);

                if (reflectedNode.getModifier() === ModifierType.public) {
                    result.push(reflectedNode);
                }
            }
        }

        return result;
    }

    private _getClassNode(): ts.ClassDeclaration | ts.ClassExpression | null {
        if (ts.isClassDeclaration(this._node) || ts.isClassExpression(this._node)) {
            return this._node;
        }

        const decl = this._node.declarationList.declarations[0];
        const initializer = decl?.initializer;

        if (!initializer || !ts.isClassExpression(initializer)) {
            return null;
        }

        return initializer;
    }

    /**
     * Checks it the node is a custom element. As of right now we treat a node to be a custom element
     * if HTMLElement is in the heritage chain.
     *
     * @param node - The node to check
     * @param context - The analyzer context where the node belongs to
     * @returns True if the node extends HTMLElement
     */
    private _isCustomElement(node: ClassLike, context: ProjectContext): boolean {
        const checker = context.getTypeChecker();
        const type = checker.getTypeAtLocation(node);
        const baseTypes = type.isClassOrInterface() ? checker.getBaseTypes(type) : [];

        for (const baseType of baseTypes) {
            if (this._hasHTMLElementAsBase(baseType, checker)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks in the heritage chain if there is an HTMLElement type.
     *
     * @param type - The base type to check
     * @param checker - The TypeScript type checker from the analyzer context
     * @returns True if HTMLElement has been found as a base type
     */
    private _hasHTMLElementAsBase(type: ts.Type, checker: ts.TypeChecker): boolean {
        const name = type.getSymbol()?.getName();

        if (name === 'HTMLElement') {
            return true;
        }

        if (!type.isClassOrInterface()) {
            return false;
        }

        return checker.getBaseTypes(type).some(t => this._hasHTMLElementAsBase(t, checker));
    }
}
