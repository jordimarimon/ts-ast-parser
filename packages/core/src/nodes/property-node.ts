import { isAbstract, isOptional, isStaticMember } from '../utils/class-member.js';
import { PropertyLikeNode, SymbolWithContext } from '../utils/is.js';
import { resolveExpression } from '../utils/resolve-expression.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition } from '../utils/get-location.js';
import { getReturnStatement } from '../utils/function.js';
import { getTypeFromTSType } from '../utils/get-type.js';
import { MemberKind } from '../models/member-kind.js';
import { getDecorators } from '../utils/decorator.js';
import { ReflectedNode } from './reflected-node.js';
import { DecoratorNode } from './decorator-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import { ClassField } from '../models/class.js';
import { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import { JSDocNode } from './jsdoc-node.js';
import { Type } from '../models/type.js';
import ts from 'typescript';


export class PropertyNode implements ReflectedNode<ClassField, PropertyLikeNode> {

    private readonly _node: PropertyLikeNode;

    private readonly _member: SymbolWithContext;

    private readonly _context: AnalyzerContext;

    constructor(node: PropertyLikeNode, member: SymbolWithContext, context: AnalyzerContext) {
        this._node = node;
        this._member = member;
        this._context = context;
    }

    getName(): string {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return getter.name?.getText() ?? '';
        }

        if (setter) {
            return setter.name?.getText() ?? '';
        }

        return this._node.name.getText() ?? '';
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

    getContext(): AnalyzerContext {
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

        return getLinePosition(this._node);
    }

    getType(): Type {
        const jsDocType = this.getJSDoc().getJSDocTag(JSDocTagName.type)?.getValue<string>() ?? '';

        return jsDocType ? {text: jsDocType} : getTypeFromTSType(this._member.type, this._context);
    }

    getDefault(): unknown {
        const jsDocDefaultValue = this.getJSDoc().getJSDocTag(JSDocTagName.default)?.getValue<string>() ?? '';
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

    getJSDoc(): JSDocNode {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return new JSDocNode(getter);
        }

        if (setter) {
            return new JSDocNode(setter);
        }

        return new JSDocNode(this._node);
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
        return isOptional(this._member.symbol);
    }

    isStatic(): boolean {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return isStaticMember(getter);
        }

        if (setter) {
            return isStaticMember(setter);
        }

        return isStaticMember(this._node);
    }

    isReadOnly(): boolean {
        const readOnlyTag = !!this.getJSDoc().getJSDocTag(JSDocTagName.readonly)?.getValue();
        const [getter, setter] = this._getAccessors();

        return readOnlyTag || (!!getter && !setter);
    }

    isWriteOnly(): boolean {
        const [getter, setter] = this._getAccessors();

        return !getter && !!setter;
    }

    isAbstract(): boolean {
        return isAbstract(this._node);
    }

    isInherited(): boolean {
        return !this._member.overrides && !!this._member.inherited;
    }

    overrides(): boolean {
        return !!this._member.overrides;
    }

    toPOJO(): ClassField {
        const tmpl: ClassField = {
            name: this.getName(),
            line: this.getLine(),
            kind: this.getKind(),
            type: this.getType(),
        };

        tryAddProperty(tmpl, 'optional', this.isOptional());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().toPOJO());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.toPOJO()));
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
        const decls = this._member.symbol?.getDeclarations() ?? [];
        const getter = decls.find(ts.isGetAccessor);
        const setter = decls.find(ts.isSetAccessor);

        return [getter, setter];
    }

}
