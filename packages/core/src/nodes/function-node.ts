import type { FunctionDeclaration } from '../models/function.js';
import { DeclarationKind } from '../models/declaration.js';
import type { Method, ModifierType } from '../models/member.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import { MemberKind } from '../models/member.js';
import { getDecorators } from '../utils/decorator.js';
import { getModifiers } from '../utils/modifiers.js';
import { DecoratorNode } from './decorator-node.js';
import { SignatureNode } from './signature-node.js';
import { CommentNode } from './comment-node.js';
import ts from 'typescript';
import type { ReflectedNode } from '../reflected-node.js';
import type { SymbolWithContext } from './class-or-interface-node.js';


type NodeWithFunctionDeclaration =
    | ts.VariableStatement
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.MethodSignature
    | ts.ConstructorDeclaration
    | ts.ConstructSignatureDeclaration
    | ts.PropertyDeclaration
    | ts.PropertySignature;

type FunctionLikeNode =
    | ts.FunctionDeclaration
    | ts.ArrowFunction
    | ts.MethodSignature
    | ts.ConstructorDeclaration
    | ts.ConstructSignatureDeclaration
    | ts.FunctionExpression
    | ts.FunctionTypeNode
    | ts.MethodDeclaration;

/**
 * Represents the reflected node of a function declaration
 */
export class FunctionNode implements ReflectedNode<FunctionDeclaration | Method, NodeWithFunctionDeclaration> {

    private readonly _node: NodeWithFunctionDeclaration;

    private readonly _member: SymbolWithContext | null | undefined;

    private readonly _context: ProjectContext;

    private readonly _jsDoc: CommentNode | null = null;

    constructor(
        node: NodeWithFunctionDeclaration,
        context: ProjectContext,
        member: SymbolWithContext | null | undefined,
    ) {
        this._node = node;
        this._member = member;
        this._context = context;

        // Function/Method declarations have the JSDoc in the signature also.
        // We don't want to emit it twice in these cases.
        if (
            ts.isVariableStatement(node) ||
            ts.isPropertyDeclaration(node) ||
            ts.isPropertySignature(node)
        ) {
            this._jsDoc = new CommentNode(node, context);
        }
    }

    getName(): string {
        if (
            ts.isFunctionDeclaration(this._node) ||
            ts.isMethodDeclaration(this._node) ||
            ts.isMethodSignature(this._node) ||
            ts.isPropertyDeclaration(this._node) ||
            ts.isPropertySignature(this._node)
        ) {
            return this._node.name?.getText() ?? '';
        }

        if (ts.isVariableStatement(this._node)) {
            const declaration = this._node.declarationList.declarations.find(decl => {
                return !!decl.initializer &&
                    (ts.isArrowFunction(decl.initializer) ||
                        ts.isFunctionExpression(decl.initializer));
            });

            return declaration?.name.getText() ?? '';
        }

        return '';
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getKind(): MemberKind.Method | DeclarationKind.Function {
        return this._isMember(this._node) ? MemberKind.Method : DeclarationKind.Function;
    }

    getTsNode(): NodeWithFunctionDeclaration {
        return this._node;
    }

    getLine(): number | null {
        return this._context.getLocation(this._node).line;
    }

    getJSDoc(): CommentNode | null {
        return this._jsDoc;
    }

    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    getDecoratorWithName(name: string): DecoratorNode | null {
        return this.getDecorators().find(d => d.getName() === name) ?? null;
    }

    getSignatures(): SignatureNode[] {
        const func = this._getFunctionNode();
        const checker = this._context.getTypeChecker();

        // For methods in classes or interfaces as we need the context
        // of the implementation (type parameters resolved). That's why we use
        // the type provided by the class/interface member.
        let funcType: ts.Type | null | undefined = this._member?.type;

        // When it's not a method or a property in a class or interface
        if (!funcType) {
            const symbol = func && this._context.getSymbol(func);
            funcType = func && symbol && checker.getTypeOfSymbolAtLocation(symbol, func.getSourceFile());
        }

        // Anonymous functions
        if (!funcType) {
            const signature = func && checker.getSignatureFromDeclaration(func);
            return signature ? [new SignatureNode(signature, this._context)] : [];
        }

        // It doesn't return the signature that has the implementation
        // of the method/function body when there is overloading.
        return funcType
            .getNonNullableType()
            .getCallSignatures()
            .map(signature => {
                return new SignatureNode(signature, this._context);
            });
    }

    getModifier(): ModifierType | null {
        if (!ts.isClassElement(this._node)) {
            return null;
        }

        return getVisibilityModifier(this._node);
    }

    isGenerator(): boolean {
        const func = this._getFunctionNode();

        return !!func && !ts.isMethodSignature(func) && !ts.isFunctionTypeNode(func) && !!func.asteriskToken;
    }

    isAsync(): boolean {
        const func = this._getFunctionNode();

        if (!func) {
            return false;
        }

        return getModifiers(func).some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);
    }

    isOptional(): boolean {
        return isOptional(this._member?.symbol);
    }

    isStatic(): boolean {
        return isStatic(this._node);
    }

    isReadOnly(): boolean {
        return isReadOnly(this._node);
    }

    isAbstract(): boolean {
        return isAbstract(this._node);
    }

    isInherited(): boolean {
        return !this._member?.overrides && !!this._member?.inherited;
    }

    isArrowFunctionOrFunctionExpression(): boolean {
        if (!ts.isVariableStatement(this._node)) {
            return false;
        }

        return this._node.declarationList.declarations.some(decl => {
            return !!decl.initializer &&
                (ts.isArrowFunction(decl.initializer) ||
                    ts.isFunctionExpression(decl.initializer));
        });
    }

    overrides(): boolean {
        return !!this._member?.overrides;
    }

    /**
     * Serializes the reflected node
     *
     * @returns The reflected node as a serializable object
     */
    serialize(): FunctionDeclaration | Method {
        const tmpl: FunctionDeclaration | Method = {
            name: this.getName(),
            kind: this.getKind(),
            signatures: this.getSignatures().map(signature => signature.serialize()),
        };

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc()?.serialize());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.serialize()));
        tryAddProperty(tmpl, 'async', this.isAsync());
        tryAddProperty(tmpl, 'generator', this.isGenerator());

        tryAddProperty(tmpl as Method, 'static', this.isStatic());
        tryAddProperty(tmpl as Method, 'readOnly', this.isReadOnly());
        tryAddProperty(tmpl as Method, 'abstract', this.isAbstract());
        tryAddProperty(tmpl as Method, 'override', this.overrides());
        tryAddProperty(tmpl as Method, 'inherited', this.isInherited());
        tryAddProperty(tmpl as Method, 'optional', this.isOptional());

        return tmpl;
    }

    private _getFunctionNode(): FunctionLikeNode | null {
        let func: ts.Node | undefined | null = this._node;

        if (ts.isVariableStatement(this._node)) {
            const declaration = this._node.declarationList.declarations.find(decl => {
                return !!decl.initializer &&
                    (ts.isArrowFunction(decl.initializer) ||
                        ts.isFunctionExpression(decl.initializer));
            });

            func = declaration?.initializer;
        }

        if (ts.isPropertySignature(this._node)) {
            func = this._node.type && ts.isFunctionTypeNode(this._node.type)
                ? this._node.type
                : null;
        }

        if (ts.isPropertyDeclaration(this._node)) {
            func = this._node.initializer;
        }

        if (
            func == null ||
            (!ts.isFunctionDeclaration(func) &&
                !ts.isArrowFunction(func) &&
                !ts.isFunctionExpression(func) &&
                !ts.isMethodSignature(func) &&
                !ts.isMethodDeclaration(func) &&
                !ts.isFunctionTypeNode(func))
        ) {
            return null;
        }

        return func;
    }

    private _isMember(node: ts.Node): node is ts.Declaration {
        return (
            ts.isMethodSignature(node) ||
            ts.isPropertySignature(node) ||
            ts.isPropertyDeclaration(node) ||
            ts.isMethodDeclaration(node)
        );
    }
}
