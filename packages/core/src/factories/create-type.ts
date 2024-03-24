import type { ReflectedType } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import { assert } from '../analyser-diagnostic.js';
import ts from 'typescript';

import { TemplateLiteralTypeNode } from '../types/template-literal-type-node.js';
import { IndexedAccessTypeNode } from '../types/indexed-access-type-node.js';
import { NamedTupleMemberNode } from '../types/named-tuple-member-node.js';
import { IntersectionTypeNode } from '../types/intersection-type-node.js';
import { ConditionalTypeNode } from '../types/conditional-type-node.js';
import { IntrinsicTypeNode } from '../types/intrinsic-type-node.js';
import { TypeReferenceNode } from '../types/type-reference-node.js';
import { TypePredicateNode } from '../types/type-predicate-node.js';
import { TypeOperatorNode } from '../types/type-operator-node.js';
import { FunctionTypeNode } from '../types/function-type-node.js';
import { OptionalTypeNode } from '../types/optional-type-node.js';
import { TypeLiteralNode } from '../types/type-literal-node.js';
import { LiteralTypeNode } from '../types/literal-type-node.js';
import { MappedTypeNode } from '../types/mapped-type-node.js';
import { TypeQueryNode } from '../types/type-query-node.js';
import { InferTypeNode } from '../types/infer-type-node.js';
import { UnionTypeNode } from '../types/union-type-node.js';
import { ArrayTypeNode } from '../types/array-type-node.js';
import { TupleTypeNode } from '../types/tuple-type-node.js';
import { RestTypeNode } from '../types/rest-type-node.js';
import { ParenthesizedTypeNode } from '../types/parenthesized-type-node.js';


type ReflectorTypeFactory = (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => ReflectedType;

const types: { [key in ts.SyntaxKind]?: ReflectorTypeFactory } = {
    // case of: {a: number}
    [ts.SyntaxKind.TypeLiteral]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new TypeLiteralNode(node as ts.TypeLiteralNode, type, context);
    },

    // Represents a conditional type like `Foo extends SomeType ? true : false;`
    [ts.SyntaxKind.ConditionalType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new ConditionalTypeNode(node as ts.ConditionalTypeNode, type, context);
    },

    // case of: number | string
    [ts.SyntaxKind.UnionType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new UnionTypeNode(node as ts.UnionTypeNode, type, context);
    },

    // case of: number & string
    [ts.SyntaxKind.IntersectionType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntersectionTypeNode(node as ts.IntersectionTypeNode, type, context);
    },

    // Represents an array type like `number[]`
    [ts.SyntaxKind.ArrayType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new ArrayTypeNode(node as ts.ArrayTypeNode, type, context);
    },

    // Represents a type that refers to another reflection like a class, interface or enum.
    // case of referencing another type: MyClass<T>
    [ts.SyntaxKind.TypeReference]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new TypeReferenceNode(node as ts.TypeReferenceNode, type, context);
    },

    // case of: [number, number]
    [ts.SyntaxKind.TupleType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new TupleTypeNode(node as ts.TupleTypeNode, type, context);
    },

    // Represents a named member of a tuple type like `[name: string]`
    [ts.SyntaxKind.NamedTupleMember]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new NamedTupleMemberNode(node as ts.NamedTupleMember, type, context);
    },

    // case of: readonly number[]
    [ts.SyntaxKind.TypeOperator]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new TypeOperatorNode(node as ts.TypeOperatorNode, type, context);
    },

    // case of: "Alice", "Bob", 3, 4, etc...
    [ts.SyntaxKind.LiteralType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new LiteralTypeNode(node as ts.LiteralTypeNode, type, context);
    },

    // Represents an indexed access type like `T['name']`
    [ts.SyntaxKind.IndexedAccessType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IndexedAccessTypeNode(node as ts.IndexedAccessTypeNode, type, context);
    },

    // case of: () => void
    [ts.SyntaxKind.FunctionType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new FunctionTypeNode(node as ts.FunctionTypeNode, type, context);
    },

    // Represents a type that is constructed by querying the type of reflection.
    // case of: typeof FooClass
    [ts.SyntaxKind.TypeQuery]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new TypeQueryNode(node as ts.TypeQueryNode, type, context);
    },

    // case of: infer T extends FooBar
    [ts.SyntaxKind.InferType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new InferTypeNode(node as ts.InferTypeNode, type, context);
    },

    // case of: { [K in Parameter]?: Template }
    [ts.SyntaxKind.MappedType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new MappedTypeNode(node as ts.MappedTypeNode, type, context);
    },

    // case of: type Z = [1, 2?]
    //                       ^^
    [ts.SyntaxKind.OptionalType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new OptionalTypeNode(node as ts.OptionalTypeNode, type, context);
    },

    // case of:
    //          function isString(x: unknown): x is string {}
    //          function assert(condition: boolean): asserts condition {}
    [ts.SyntaxKind.TypePredicate]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new TypePredicateNode(node as ts.TypePredicateNode, type, context);
    },

    // case of: type Z = [1, ...2[]]
    //                       ^^^^^^
    [ts.SyntaxKind.RestType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new RestTypeNode(node as ts.RestTypeNode, type, context);
    },

    // case of: type Z = `${'a' | 'b'}${'a' | 'b'}`
    [ts.SyntaxKind.TemplateLiteralType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new TemplateLiteralTypeNode(node as ts.TemplateLiteralTypeNode, type, context);
    },

    // case of: type foo = (number|number[])
    [ts.SyntaxKind.ParenthesizedType]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new ParenthesizedTypeNode(node as ts.ParenthesizedTypeNode, type, context);
    },

    // Represents an intrinsic type like `string` or `boolean`.
    [ts.SyntaxKind.AnyKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.BigIntKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.BooleanKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.NeverKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.NumberKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.ObjectKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.StringKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.SymbolKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.UndefinedKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.VoidKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
    [ts.SyntaxKind.UnknownKeyword]: (node: ts.TypeNode, type: ts.Type, context: ProjectContext) => {
        return new IntrinsicTypeNode(node, type, context);
    },
};

export function createType(node: ts.TypeNode, context: ProjectContext): ReflectedType {
    const checker = context.getTypeChecker();
    const diagnostic = context.getDiagnostics();
    const type = checker.getTypeFromTypeNode(node);
    const factory = types[node.kind];
    const message = `Type not supported: "${ts.SyntaxKind[node.kind]}"`;
    const error = diagnostic.format(diagnostic.create(node, message));

    assert(factory !== undefined, error);

    return factory(node, type, context);
}

export function createTypeFromDeclaration(node: ts.Node, context: ProjectContext): ReflectedType {
    const checker = context.getTypeChecker();
    const diagnostic = context.getDiagnostics();
    const jsDocType = ts.getJSDocType(node);

    if (jsDocType) {
        return createType(jsDocType, context);
    }

    // Generalize the type of declarations if it's not
    // an assertion like "const x = [4, 5] as const"
    let type = checker.getTypeAtLocation(node);
    if (!isTypeAssertion(node)) {
        // Don't use the inferred literal types.
        // For example "const x = 4" gives "x: 4" instead of "x: number"
        type = checker.getBaseTypeOfLiteralType(type);
    }

    const message = `Unable to reflect type from declaration: "${ts.SyntaxKind[node.kind]}"`;
    const error = diagnostic.format(diagnostic.create(node, message));
    const typeNode = checker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.IgnoreErrors);

    assert(typeNode !== undefined, error);

    const factory = types[typeNode.kind];

    assert(factory !== undefined, error);

    return factory(typeNode, type, context);
}

/**
 * Checks whether the node has a type assertion
 *
 * For example:
 *
 * ```ts
 * const foo = [4, 5] as const;
 * const bar = <[4, 5]>[4, 5];
 * ```
 *
 * @param node - The TypeScript node to check
 * @returns True if the node has a type assertion, otherwise false
 */
function isTypeAssertion(node: ts.Node): boolean {
    return (
        ts.hasOnlyExpressionInitializer(node) &&
        !!node.initializer &&
        (ts.isAsExpression(node.initializer) || ts.isTypeAssertionExpression(node))
    );
}
