import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from '../utils/symbol.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { getLinePosition } from '../utils/get-location.js';
import type { ReflectedNode } from './reflected-node.js';
import type { AnalyserContext } from '../context.js';
import { PropertyNode } from './property-node.js';
import { FunctionNode } from './function-node.js';
import type { Method } from '../models/member.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


export class TypeNode implements ReflectedNode<Type, ts.TypeNode> {

    private readonly _node: ts.TypeNode | null;

    private readonly _type: ts.Type | null;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypeNode | null, type: ts.Type | null, context: AnalyserContext) {
        this._node = node;
        this._type = type ?? (node ? context.checker.getTypeFromTypeNode(node) : null);
        this._context = context;
    }

    static fromType(type: ts.Type, context: AnalyserContext): TypeNode {
        const typeNode = context.checker.typeToTypeNode(type, void 0, ts.NodeBuilderFlags.IgnoreErrors) ?? null;
        return new TypeNode(typeNode, type, context);
    }

    static fromNode(node: ts.Node, context: AnalyserContext): TypeNode {
        const checker = context.checker;
        const typeTag = ts.getJSDocType(node);

        if (typeTag) {
            return new TypeNode(typeTag, checker.getTypeFromTypeNode(typeTag), context);
        }

        let type = checker.getTypeAtLocation(node);

        // Don't generalize the type of declarations like "const x = [4, 5] as const"
        if (!this._isTypeAssertion(node)) {
            // Don't use the inferred literal types.
            // For example "const x = 4" gives "x: 4" instead of "x: number"
            type = checker.getBaseTypeOfLiteralType(type);
        }

        return TypeNode.fromType(type, context);
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getTSNode(): ts.TypeNode | null {
        return this._node;
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getText(): string {
        if (this._type) {
            return this._context.checker.typeToString(this._type) ?? '';
        }

        return this._node?.getText() ?? '';
    }

    getLine(): number | null {
        return this._node ? getLinePosition(this._node) : null;
    }

    /**
     * Whether the type is a primitive type.
     *
     * @see https://developer.mozilla.org/en-US/docs/Glossary/Primitive
     */
    isPrimitive(): boolean {
        if (this._type) {
            const primitiveTypes = ts.TypeFlags.String
                | ts.TypeFlags.StringLiteral
                | ts.TypeFlags.Number
                | ts.TypeFlags.NumberLiteral
                | ts.TypeFlags.Boolean
                | ts.TypeFlags.BooleanLiteral
                | ts.TypeFlags.BigInt
                | ts.TypeFlags.BigIntLiteral
                | ts.TypeFlags.Null
                | ts.TypeFlags.Undefined
                | ts.TypeFlags.ESSymbol;

            return (this._type.flags & primitiveTypes) !== 0;
        }

        return false;
    }

    /**
     * Whether the type is an object literal:
     *
     *      type foo = {a: number}
     */
    isLiteral(): boolean {
        return !!this._node && ts.isTypeLiteralNode(this._node);
    }

    /**
     * Whether the type is a conditional type:
     *
     *      type foo<T> = T extends numer ? 0 : 1
     */
    isConditional(): boolean {
        return !!this._node && ts.isConditionalTypeNode(this._node);
    }

    /**
     * Whether the type is made of a union of two or more types:
     *
     *      type foo = string | number
     */
    isUnion(): boolean {
        return !!this._node && ts.isUnionTypeNode(this._node);
    }

    /**
     * Whether the type is made of an intersection of two or more types:
     *
     *      type foo = string & number
     */
    isIntersection(): boolean {
        return !!this._node && ts.isIntersectionTypeNode(this._node);
    }

    /**
     * Whether the type is an ArrayType:
     *
     *      type foo = string[]
     */
    isArray(): boolean {
        return !!this._node && ts.isArrayTypeNode(this._node);
    }

    /**
     * Whether the type references another type:
     *
     *      type Foo = Bar;
     */
    isReference(): boolean {
        return !!this._node && ts.isTypeReferenceNode(this._node);
    }

    /**
     * If the type is a TypeLiteral, it will return the properties defined.
     *
     * If the type is not a TypeLiteral, it will return an empty array.
     */
    getProperties(): PropertyNode[] {
        if (!this.isLiteral()) {
            return [];
        }

        const members = (this._node as ts.TypeLiteralNode).members ?? [];
        const result: PropertyNode[] = [];

        for (const member of members) {
            if (!ts.isPropertySignature(member)) {
                continue;
            }

            result.push(new PropertyNode(member, null, this._context));
        }

        return result;
    }

    /**
     * If the type is a TypeLiteral, it will return the methods defined.
     *
     * If the type is not a TypeLiteral, it will return an empty array,
     */
    getMethods(): FunctionNode[] {
        if (!this.isLiteral()) {
            return [];
        }

        const members = (this._node as ts.TypeLiteralNode).members ?? [];
        const result: FunctionNode[] = [];

        for (const member of members) {
            if (ts.isMethodSignature(member)) {
                result.push(new FunctionNode(member, null, this._context));
            }
        }

        return result;
    }

    getElements(): TypeNode[] {
        if (!this.isUnion() && !this.isIntersection()) {
            return [];
        }

        return (this._node as ts.UnionTypeNode | ts.IntersectionTypeNode).types.map(t => {
            return new TypeNode(t, null, this._context);
        });
    }

    getElementType(): TypeNode | null {
        if (!this.isArray()) {
            return null;
        }

        return new TypeNode((this._node as ts.ArrayTypeNode).elementType, null, this._context);
    }

    getReferenceType(): TypeNode | null {
        if (!this.isReference()) {
            return null;
        }

        const checker = this._context.checker;
        const referenceName = (this._node as ts.TypeReferenceNode).typeName;
        const tsType = checker.getTypeAtLocation(referenceName);
        const typeNode = checker.typeToTypeNode(tsType, void 0, ts.NodeBuilderFlags.IgnoreErrors);

        if (typeNode) {
            return new TypeNode(typeNode, tsType, this._context);
        }

        const symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(referenceName, checker), checker);

        if (!symbol) {
            return null;
        }

        const node = symbol.getDeclarations()?.find(ts.isTypeNode) as ts.TypeNode | undefined;

        if (!node) {
            return new TypeNode(null, tsType, this._context);
        }

        return new TypeNode(node, tsType, this._context);
    }

    getTypeArguments(): TypeNode[] {
        if (!this.isReference()) {
            return [];
        }

        const args = (this._node as ts.TypeReferenceNode).typeArguments ?? [];

        return args.map(t => new TypeNode(t, null, this._context));
    }

    serialize(): Type {
        const tmpl: Type = {
            text: this.getText(),
        };

        if (this.isConditional()) {
            tmpl.kind = TypeKind.Conditional;
        } else if (this.isIntersection()) {
            tmpl.kind = TypeKind.Intersection;
        } else if (this.isUnion()) {
            tmpl.kind = TypeKind.Union;
        } else if (this.isArray()) {
            tmpl.kind = TypeKind.Array;
        } else if (this.isLiteral()) {
            tmpl.kind = TypeKind.Literal;
        } else if (this.isPrimitive()) {
            tmpl.kind = TypeKind.Primitive;
        }

        tryAddProperty(tmpl, 'elements', this.getElements().map(e => e.serialize()));
        tryAddProperty(tmpl, 'properties', this.getProperties().map(p => p.serialize()));
        tryAddProperty(tmpl, 'methods', this.getMethods().map(m => m.serialize() as Method));
        tryAddProperty(tmpl, 'elementType', this.getElementType()?.serialize());

        return tmpl;
    }

    /**
     * Checks whether the node has a type assertion
     *
     * For example:
     *
     *      const foo = [4, 5] as const;
     *      const bar = <[4, 5]>[4, 5];
     */
    private static _isTypeAssertion(node: ts.Node): boolean {
        return ts.hasOnlyExpressionInitializer(node) && !!node.initializer &&
            (ts.isAsExpression(node.initializer) || ts.isTypeAssertionExpression(node));
    }
}
