import { getVisibilityModifier, isAbstract, isReadOnly, isStaticMember } from '../utils/class.js';
import { FunctionLikeDeclaration, SymbolWithContextType } from '../utils/types.js';
import { isArrowFunction, isFunctionExpression } from '../utils/function.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { FunctionDeclaration } from '../models/function.js';
import { getSymbolAtLocation } from '../utils/symbol.js';
import { DeclarationNode } from './declaration-node.js';
import { getDecorators } from '../utils/decorator.js';
import { getNamespace } from '../utils/namespace.js';
import { getModifiers } from '../utils/modifiers.js';
import { DecoratorNode } from './decorator-node.js';
import { SignatureNode } from './signature-node.js';
import { ClassMethod } from '../models/class.js';
import { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { FunctionLikeNode } from './is.js';
import ts from 'typescript';


export class FunctionNode implements DeclarationNode<FunctionDeclaration | ClassMethod, FunctionLikeNode> {

    private readonly _node: FunctionLikeNode;

    private readonly _member: SymbolWithContextType | undefined;

    private readonly _context: AnalyzerContext;

    constructor(node: FunctionLikeNode, context: AnalyzerContext, member?: SymbolWithContextType | undefined) {
        this._node = node;
        this._member = member;
        this._context = context;
    }

    getName(): string {
        if (
            ts.isFunctionDeclaration(this._node) ||
            ts.isMethodDeclaration(this._node) ||
            ts.isMethodSignature(this._node)
        ) {
            return this._node?.name?.getText() || '';
        }

        if (ts.isPropertyDeclaration(this._node) || ts.isPropertySignature(this._node)) {
            return this._node.name?.getText() || '';
        }

        if (ts.isVariableStatement(this._node)) {
            const declaration = this._node.declarationList.declarations.find(decl => {
                return isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer);
            });

            return declaration?.name?.getText() || '';
        }

        return '';
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getKind(): DeclarationKind.Method | DeclarationKind.Function {
        return ts.isPropertyDeclaration(this._node) || ts.isMethodDeclaration(this._node)
            ? DeclarationKind.Method
            : DeclarationKind.Function;
    }

    getTSNode(): FunctionLikeNode {
        return this._node;
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

    getSignatures(): SignatureNode[] {
        const func = this._getFunctionNode();
        const checker = this._context.checker;

        let funcType: ts.Type | null | undefined = this._member?.type;

        if (!funcType) {
            const symbol = func && getSymbolAtLocation(func, this._context.checker);
            funcType = func && symbol && checker?.getTypeOfSymbolAtLocation(symbol, func.getSourceFile());
        }

        // Anonymous functions
        if (!funcType) {
            const signature = func && checker?.getSignatureFromDeclaration(func);
            return signature ? [new SignatureNode(signature, this._context)] : [];
        }

        // FIXME(Jordi M.): It doesn't return the signature that has the implementation
        //  of the method/function body when there is overloading.
        //  We could do something like:
        //          symbol.getDeclarations().map(d => checker.getSignatureFromDeclaration(d))
        //  but this won't work for methods in classes or interfaces as we need the context
        //  of the implementation (type parameters resolved).
        return funcType.getNonNullableType().getCallSignatures().map(signature => {
            return new SignatureNode(signature, this._context);
        });
    }

    isGenerator(): boolean {
        const func = this._getFunctionNode();

        if (func && (ts.isFunctionDeclaration(func) || ts.isFunctionExpression(func) || ts.isMethodDeclaration(func))) {
            return !!func.asteriskToken;
        }

        return false;
    }

    isAsync(): boolean {
        const func = this._getFunctionNode();

        if (!func) {
            return false;
        }

        return getModifiers(func).some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);
    }

    toPOJO(): FunctionDeclaration | ClassMethod {
        const tmpl: FunctionDeclaration | ClassMethod = {
            name: this.getName(),
            kind: this.getKind(),
            signatures: this.getSignatures().map(signature => signature.toPOJO()),
        };

        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().toPOJO());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.toPOJO()));
        tryAddProperty(tmpl, 'async', this.isAsync());
        tryAddProperty(tmpl, 'generator', this.isGenerator());

        if (ts.isPropertyDeclaration(this._node) || ts.isMethodDeclaration(this._node)) {
            tryAddProperty(tmpl as ClassMethod, 'static', isStaticMember(this._node));
            tryAddProperty(tmpl as ClassMethod, 'modifier', getVisibilityModifier(this._node));
            tryAddProperty(tmpl as ClassMethod, 'readOnly', isReadOnly(this._node));
            tryAddProperty(tmpl as ClassMethod, 'abstract', isAbstract(this._node));
            tryAddProperty(tmpl as ClassMethod, 'override', this._member?.overrides);
            tryAddProperty(tmpl as ClassMethod, 'inherited', !this._member?.overrides && this._member?.inherited);
        }

        return tmpl;
    }

    private _getFunctionNode(): FunctionLikeDeclaration {
        let func: ts.Node | undefined | null = this._node;

        if (ts.isVariableStatement(this._node)) {
            const declaration = this._node.declarationList.declarations.find(decl => {
                return isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer);
            });

            func = declaration?.initializer;
        }

        if (ts.isPropertySignature(this._node)) {
            func = this._node.type?.kind === ts.SyntaxKind.FunctionType
                ? this._node.type as ts.FunctionTypeNode
                : null;
        }

        if (ts.isPropertyDeclaration(this._node)) {
            func = this._node.initializer;
        }

        if (
            func == null ||
            (
                !ts.isFunctionDeclaration(func) &&
                !ts.isArrowFunction(func) &&
                !ts.isFunctionExpression(func) &&
                !ts.isMethodSignature(func) &&
                !ts.isMethodDeclaration(func) &&
                !ts.isFunctionTypeNode(func)
            )
        ) {
            return null;
        }

        return func;
    }

}