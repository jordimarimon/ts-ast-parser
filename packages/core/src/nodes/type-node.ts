import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from '../utils/symbol.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { SourceReference } from '../models/reference.js';
import type { ReflectedNode } from './reflected-node.js';
import { getLocation } from '../utils/get-location.js';
import type { AnalyserContext } from '../context.js';
import { PropertyNode } from './property-node.js';
import { FunctionNode } from './function-node.js';
import type { Method } from '../models/member.js';
import { isThirdParty } from '../utils/import.js';
import type { Type } from '../models/type.js';
import { TypeKind } from '../models/type.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


// TODO(Jordi M.): Create a type node class for each kind
// TODO(Jordi M.): Handle the case where the TypeNode is a TypeOperator node (test/variable/type-assertion)


export class TypeNode implements ReflectedNode<Type, ts.TypeNode> {

    private readonly _node: ts.TypeNode | null;

    private readonly _type: ts.Type | null;

    private readonly _context: AnalyserContext;

    constructor(node: ts.TypeNode | ts.NamedTupleMember | null, type: ts.Type | null, context: AnalyserContext) {
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
            return new TypeNode(typeTag, null, context);
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

    getTupleMemberName(): string {
        if (!this._node || !ts.isNamedTupleMember(this._node)) {
            return '';
        }

        return this._node.name.escapedText ?? '';
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    getText(): string {
        if (this.isReference()) {
            const ref = this._node as ts.TypeReferenceNode;

            if (ts.isIdentifier(ref.typeName)) {
                const name = ref.typeName.escapedText ?? '';
                const args: string[] = (ref.typeArguments ?? []).map(t => {
                    return new TypeNode(t, null, this._context).getText();
                });

                return args.length > 0 ? `${name}<${args.join(', ')}>` : name;
            }
        }

        if (this.isTuple()) {
            const elements = this.getElements().map(type => {
                const node = type.getTSNode();

                if (node && ts.isNamedTupleMember(node)) {
                    return `${type.getTupleMemberName()}: ${type.getText()}`;
                }

                return type.getText();
            });

            return `[${elements.join(', ')}]`;
        }

        if (this.isPrimitive()) {
            return this._getPrimitiveTypeText();
        }

        // There are type like primitive types where the node doesn't
        // have a real position defined and the operation "getText()" won't work
        try {
            return this._node?.getText() ?? '';
        } catch (_) {
            return (this._type && this._context.checker.typeToString(this._type)) ?? '';
        }
    }

    getPath(): string {
        let path = '';

        if (this.isReference() && ts.isIdentifier((this._node as ts.TypeReferenceNode).typeName)) {
            const ref = (this._node as ts.TypeReferenceNode).typeName as ts.Identifier;
            path = getLocation(ref, this._context).path;
        }

        if (!path && this._type) {
            path = getLocation(this._type, this._context).path;
        }

        return !path && this._node ? getLocation(this._node, this._context).path : path;
    }

    getLine(): number | null {
        let line: number | null = null;

        if (this.isReference() && ts.isIdentifier((this._node as ts.TypeReferenceNode).typeName)) {
            const ref = (this._node as ts.TypeReferenceNode).typeName as ts.Identifier;
            line = getLocation(ref, this._context).line;
        }

        if (line == null && this._type) {
            line = getLocation(this._type, this._context).line;
        }

        return line == null && this._node ? getLocation(this._node, this._context).line : line;
    }

    /**
     * Whether the type is a primitive type.
     *
     * @see https://developer.mozilla.org/en-US/docs/Glossary/Primitive
     */
    isPrimitive(): boolean {
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

        const isTypePrimitive = this._type && (this._type.flags & primitiveTypes) !== 0;
        const isPrimitiveKeyword = !!this._node && (
            this._node.kind === ts.SyntaxKind.NumberKeyword ||
            this._node.kind === ts.SyntaxKind.NumericLiteral ||
            this._node.kind === ts.SyntaxKind.BooleanKeyword ||
            this._node.kind === ts.SyntaxKind.StringKeyword ||
            this._node.kind === ts.SyntaxKind.StringLiteral ||
            this._node.kind === ts.SyntaxKind.UndefinedKeyword ||
            this._node.kind === ts.SyntaxKind.NullKeyword ||
            this._node.kind === ts.SyntaxKind.SymbolKeyword ||
            this._node.kind === ts.SyntaxKind.BigIntKeyword ||
            this._node.kind === ts.SyntaxKind.VoidKeyword
        );

        return isTypePrimitive || isPrimitiveKeyword;
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
     * If it's a tuple type:
     *
     *      export type RGB = [red: number, green: number, blue: number];
     */
    isTuple(): boolean {
        return !!this._node && ts.isTupleTypeNode(this._node);
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

        const checker = this._context.checker;
        const node = this._node as ts.TypeLiteralNode;
        const members = node.members ?? [];
        const result: PropertyNode[] = [];

        for (const member of members) {
            if (!ts.isPropertySignature(member)) {
                continue;
            }

            const symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(member, checker), checker);
            const type = symbol && checker.getTypeOfSymbolAtLocation(symbol, node);

            result.push(new PropertyNode(member, {symbol, type}, this._context));
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

        const checker = this._context.checker;
        const node = this._node as ts.TypeLiteralNode;
        const members = node.members ?? [];
        const result: FunctionNode[] = [];

        for (const member of members) {
            if (!ts.isMethodSignature(member)) {
                continue;
            }

            const symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(member, checker), checker);
            const type = symbol && this._context.checker.getTypeOfSymbolAtLocation(symbol, node);

            result.push(new FunctionNode(member, {symbol, type}, this._context));
        }

        return result;
    }

    getElements(): TypeNode[] {
        if (this.isUnion() || this.isIntersection()) {
            const types = (this._node as ts.UnionTypeNode | ts.IntersectionTypeNode).types;
            return types.map(typeNode => new TypeNode(typeNode, null, this._context));
        }

        if (this.isTuple()) {
            const types = (this._node as ts.TupleTypeNode).elements;
            return types.map(typeNode => new TypeNode(typeNode, null, this._context));
        }

        return [];
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

        const sourceRef: SourceReference = {};
        const path = this.getPath();
        const line = this.getLine();
        if (!isThirdParty(path) && line != null) {
            sourceRef.line = line;
            sourceRef.path = path;
        }

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
        } else if (this.isReference()) {
            tmpl.kind = TypeKind.Reference;
        } else if (this.isTuple()) {
            tmpl.kind = TypeKind.Tuple;
        }

        tryAddProperty(tmpl, 'name', this.getTupleMemberName());
        tryAddProperty(tmpl, 'elements', this.getElements().map(e => e.serialize()));
        tryAddProperty(tmpl, 'properties', this.getProperties().map(p => p.serialize()));
        tryAddProperty(tmpl, 'methods', this.getMethods().map(m => m.serialize() as Method));
        tryAddProperty(tmpl, 'elementType', this.getElementType()?.serialize());

        if (this.isReference()) {
            tryAddProperty(tmpl, 'source', sourceRef);
        }

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

    private _getPrimitiveTypeText(): string {
        const text = (this._type && this._context.checker.typeToString(this._type)) ?? '';

        if (!this._node || (text !== '' && text !== 'any')) {
            return text;
        }

        switch (this._node.kind) {
            case ts.SyntaxKind.NumberKeyword:
                return 'number';
            case ts.SyntaxKind.BooleanKeyword:
                return 'boolean';
            case ts.SyntaxKind.StringKeyword:
                return 'string';
            case ts.SyntaxKind.UndefinedKeyword:
                return 'undefined';
            case ts.SyntaxKind.NullKeyword:
                return 'null';
            case ts.SyntaxKind.SymbolKeyword:
                return 'symbol';
            case ts.SyntaxKind.BigIntKeyword:
                return 'bigint';
            case ts.SyntaxKind.VoidKeyword:
                return 'void';
            default:
                return '';
        }
    }
}
