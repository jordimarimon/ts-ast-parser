import { IndexedAccessTypeNode } from '../types/indexed-access-type-node.js';
import { NamedTupleMemberNode } from '../types/named-tuple-member-node.js';
import { IntersectionTypeNode } from '../types/intersection-type-node.js';
import { ConditionalTypeNode } from '../types/conditional-type-node.js';
import type { ReflectedTypeNode } from '../reflected-node.js';
import { PrimitiveTypeNode } from '../types/primitive-type-node.js';
import { TypeReferenceNode } from '../types/type-reference-node.js';
import { TypeOperatorNode } from '../types/type-operator-node.js';
import { TypeLiteralNode } from '../types/type-literal-node.js';
import { UnknownTypeNode } from '../types/unknown-type-node.js';
import { LiteralTypeNode } from '../types/literal-type-node.js';
import { UnionTypeNode } from '../types/union-type-node.js';
import { ArrayTypeNode } from '../types/array-type-node.js';
import { TupleTypeNode } from '../types/tuple-type-node.js';
import type { AnalyserContext } from '../context.js';
import ts from 'typescript';


// eslint-disable-next-line sonarjs/cognitive-complexity
export function createType(nodeOrType: ts.TypeNode | ts.Type, context: AnalyserContext): ReflectedTypeNode {
    let node: ts.TypeNode | null;
    let type: ts.Type;

    if ('kind' in nodeOrType) {
        node = nodeOrType;
        type = context.checker.getTypeFromTypeNode(nodeOrType);
    } else {
        node = context.checker.typeToTypeNode(nodeOrType, void 0, ts.NodeBuilderFlags.IgnoreErrors) ?? null;
        type = nodeOrType;

        if (!node) {
            return new UnknownTypeNode(null, nodeOrType, context);
        }
    }

    // case of: {a: number}
    if (ts.isTypeLiteralNode(node)) {
        return new TypeLiteralNode(node, type, context);
    }

    // Represents a conditional type like `Foo extends SomeType ? true : false;`
    if (ts.isConditionalTypeNode(node)) {
        return new ConditionalTypeNode(node, type, context);
    }

    // case of: number | string
    if (ts.isUnionTypeNode(node)) {
        return new UnionTypeNode(node, type, context);
    }

    // case of: number & string
    if (ts.isIntersectionTypeNode(node)) {
        return new IntersectionTypeNode(node, type, context);
    }

    // Represents an array type like `number[]`
    if (ts.isArrayTypeNode(node)) {
        return new ArrayTypeNode(node, type, context);
    }

    // Represents a type that refers to another reflection like a class, interface or enum.
    // case of referencing another type: MyClass<T>
    if (ts.isTypeReferenceNode(node)) {
        return new TypeReferenceNode(node, type, context);
    }

    // case of: [number, number]
    if (ts.isTupleTypeNode(node)) {
        return new TupleTypeNode(node, type, context);
    }

    // Represents a named member of a tuple type like `[name: string]`
    if (ts.isNamedTupleMember(node)) {
        return new NamedTupleMemberNode(node, type, context);
    }

    // case of: readonly number[]
    if (ts.isTypeOperatorNode(node)) {
        return new TypeOperatorNode(node, type, context);
    }

    // case of: "Alice", "Bob", 3, 4, etc...
    if (ts.isLiteralTypeNode(node)) {
        return new LiteralTypeNode(node, type, context);
    }

    // Represents an indexed access type like `T['name']`
    if (ts.isIndexedAccessTypeNode(node)) {
        return new IndexedAccessTypeNode(node, type, context);
    }

    // case of: () => void
    if (ts.isFunctionTypeNode(node)) {
        // TODO
    }

    // Represents a type that is constructed by querying the type of reflection.
    // case of: typeof FooClass
    if (ts.isTypeQueryNode(node)) {
        // TODO
    }

    // case of: infer T extends FooBar
    if (ts.isInferTypeNode(node)) {
        // TODO
    }

    // case of: { [K in Parameter]?: Template }
    if (ts.isMappedTypeNode(node)) {
        // TODO
    }

    // case of: type Z = [1, 2?]
    //                       ^^
    if (ts.isOptionalTypeNode(node)) {
        // TODO
    }

    // case of:
    //          function isString(x: unknown): x is string {}
    //          function assert(condition: boolean): asserts condition {}
    if (ts.isTypePredicateNode(node)) {
        // TODO
    }

    // case of: type Z = [1, ...2[]]
    //                       ^^^^^^
    if (ts.isRestTypeNode(node)) {
        // TODO
    }

    // case of: type Z = `${'a' | 'b'}${'a' | 'b'}`
    if (ts.isTemplateLiteralTypeNode(node)) {
        // TODO
    }

    // Represents an intrinsic/primitive type like `string` or `boolean`.
    if (isPrimitiveType(type) || isPrimitiveNode(node)) {
        return new PrimitiveTypeNode(node, type, context);
    }

    return new UnknownTypeNode(node, type, context);
}

export function createTypeFromDeclaration(node: ts.Node, context: AnalyserContext): ReflectedTypeNode {
    const checker = context.checker;
    const jsDocType = ts.getJSDocType(node);

    if (jsDocType) {
        return createType(jsDocType, context);
    }

    let type = checker.getTypeAtLocation(node);

    // Don't generalize the type of declarations like "const x = [4, 5] as const"
    if (!isTypeAssertion(node)) {
        // Don't use the inferred literal types.
        // For example "const x = 4" gives "x: 4" instead of "x: number"
        type = checker.getBaseTypeOfLiteralType(type);
    }

    return createType(type, context);
}

function isPrimitiveNode(node: ts.TypeNode): boolean {
    return node.kind === ts.SyntaxKind.NumberKeyword ||
        node.kind === ts.SyntaxKind.BooleanKeyword ||
        node.kind === ts.SyntaxKind.StringKeyword ||
        node.kind === ts.SyntaxKind.UndefinedKeyword ||
        node.kind === ts.SyntaxKind.NullKeyword ||
        node.kind === ts.SyntaxKind.SymbolKeyword ||
        node.kind === ts.SyntaxKind.BigIntKeyword ||
        node.kind === ts.SyntaxKind.VoidKeyword;
}

function isPrimitiveType(type: ts.Type): boolean {
    const primitiveTypes = ts.TypeFlags.String
        | ts.TypeFlags.Number
        | ts.TypeFlags.Boolean
        | ts.TypeFlags.BigInt
        | ts.TypeFlags.Null
        | ts.TypeFlags.Undefined
        | ts.TypeFlags.ESSymbol;

    return (type.flags & primitiveTypes) !== 0;
}

/**
 * Checks whether the node has a type assertion
 *
 * For example:
 *
 *      const foo = [4, 5] as const;
 *      const bar = <[4, 5]>[4, 5];
 */
function isTypeAssertion(node: ts.Node): boolean {
    return ts.hasOnlyExpressionInitializer(node) && !!node.initializer &&
        (ts.isAsExpression(node.initializer) || ts.isTypeAssertionExpression(node));
}
