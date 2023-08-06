import { getVisibilityModifier, isAbstract, isOptional, isReadOnly, isStatic } from '../utils/member.js';
import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from '../utils/symbol.js';
import type { PropertyLikeNode, SymbolWithContext } from '../utils/is.js';
import { resolveExpression } from '../utils/resolve-expression.js';
import type { Field, ModifierType } from '../models/member.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition, getLocation } from '../utils/get-location.js';
import { getReturnStatement } from '../utils/function.js';
import type { ReflectedNode } from './reflected-node.js';
import { MemberKind } from '../models/member-kind.js';
import { getDecorators } from '../utils/decorator.js';
import type { AnalyserContext } from '../context.js';
import { DecoratorNode } from './decorator-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { TypeNode } from './type-node.js';
import ts from 'typescript';


export class PropertyNode implements ReflectedNode<Field, PropertyLikeNode> {

    private readonly _node: PropertyLikeNode;

    private readonly _nodeContext: SymbolWithContext | null;

    private readonly _context: AnalyserContext;

    private readonly _jsDoc: JSDocNode;

    constructor(node: PropertyLikeNode, nodeContext: SymbolWithContext | null, context: AnalyserContext) {
        this._node = node;
        this._nodeContext = nodeContext;
        this._context = context;

        const [getter, setter] = this._getAccessors();

        if (getter) {
            this._jsDoc = new JSDocNode(getter);
        } else if (setter) {
            this._jsDoc = new JSDocNode(setter);
        } else {
            this._jsDoc = new JSDocNode(this._node);
        }
    }

    getName(): string {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return getter.name?.getText() ?? '';
        }

        if (setter) {
            return setter.name?.getText() ?? '';
        }

        if (ts.isIdentifier(this._node.name)) {
            return this._node.name.escapedText ?? '';
        }

        return this._node.name?.getText() ?? '';
    }

    getKind(): MemberKind.Property {
        return MemberKind.Property;
    }

    getTSNode(): PropertyLikeNode {
        return this._node;
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getLine(): number {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return getLinePosition(getter);
        }

        if (setter) {
            return getLinePosition(setter);
        }

        return getLocation(this._node, this._context).line as number;
    }

    getType(): TypeNode {
        const jsDocType = ts.getJSDocType(this._node);

        if (jsDocType) {
            return new TypeNode(jsDocType, null, this._context);
        }

        if (this._nodeContext?.type) {
            return TypeNode.fromType(this._nodeContext.type, this._context);
        }

        if (this._node.type) {
            return new TypeNode(this._node.type, null, this._context);
        }

        return TypeNode.fromNode(this._node, this._context);
    }

    getDefault(): unknown {
        const jsDocDefaultValue = this.getJSDoc().getTag(JSDocTagName.default)?.getValue<string>() ?? '';
        const [getter, setter] = this._getAccessors();

        if (jsDocDefaultValue) {
            return jsDocDefaultValue;
        }

        if (getter) {
            return resolveExpression(getReturnStatement(getter.body)?.expression, this._context.checker);
        }

        if (setter) {
            return undefined;
        }

        return resolveExpression((this._node as ts.PropertyDeclaration).initializer, this._context.checker);
    }

    getModifier(): ModifierType | null {
        if (!ts.isClassElement(this._node)) {
            return null;
        }

        return getVisibilityModifier(this._node);
    }

    getJSDoc(): JSDocNode {
        return this._jsDoc;
    }

    getDecorators(): DecoratorNode[] {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return getDecorators(getter).map(d => new DecoratorNode(d, this._context));
        }

        if (setter) {
            return getDecorators(setter).map(d => new DecoratorNode(d, this._context));
        }

        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    isOptional(): boolean {
        if (this._nodeContext) {
            return isOptional(this._nodeContext.symbol);
        }

        const checker = this._context.checker;
        const symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(this._node, checker), checker);

        return isOptional(symbol);
    }

    isStatic(): boolean {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return isStatic(getter);
        }

        if (setter) {
            return isStatic(setter);
        }

        return isStatic(this._node);
    }

    isReadOnly(): boolean {
        const readOnlyTag = !!this.getJSDoc().getTag(JSDocTagName.readonly)?.getValue<boolean>();
        const [getter, setter] = this._getAccessors();

        return readOnlyTag || (!!getter && !setter) || isReadOnly(this._node);
    }

    isWriteOnly(): boolean {
        const [getter, setter] = this._getAccessors();

        return !getter && !!setter;
    }

    isAbstract(): boolean {
        return isAbstract(this._node);
    }

    isInherited(): boolean {
        return !this._nodeContext?.overrides && !!this._nodeContext?.inherited;
    }

    overrides(): boolean {
        return !!this._nodeContext?.overrides;
    }

    serialize(): Field {
        const tmpl: Field = {
            name: this.getName(),
            kind: this.getKind(),
            type: this.getType().serialize(),
        };

        tryAddProperty(tmpl, 'line', this.getLine());
        tryAddProperty(tmpl, 'optional', this.isOptional());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.serialize()));
        tryAddProperty(tmpl, 'default', this.getDefault());
        tryAddProperty(tmpl, 'static', this.isStatic());
        tryAddProperty(tmpl, 'readOnly', this.isReadOnly());
        tryAddProperty(tmpl, 'abstract', this.isAbstract());
        tryAddProperty(tmpl, 'override', this.overrides());
        tryAddProperty(tmpl, 'inherited', this.isInherited());
        tryAddProperty(tmpl, 'writeOnly', this.isWriteOnly());

        return tmpl;
    }

    private _getAccessors(): [ts.GetAccessorDeclaration | undefined, ts.SetAccessorDeclaration | undefined] {
        const decls = this._nodeContext?.symbol?.getDeclarations() ?? [];
        const getter = decls.find(ts.isGetAccessor);
        const setter = decls.find(ts.isSetAccessor);

        return [getter, setter];
    }

}
