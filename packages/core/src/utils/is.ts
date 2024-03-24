import type { TemplateLiteralTypeNode } from '../types/template-literal-type-node.js';
import type { IndexedAccessTypeNode } from '../types/indexed-access-type-node.js';
import type { ReflectedType } from '../reflected-node.js';
import type { NamedTupleMemberNode } from '../types/named-tuple-member-node.js';
import type { IntersectionTypeNode } from '../types/intersection-type-node.js';
import type { ConditionalTypeNode } from '../types/conditional-type-node.js';
import type { TypeReferenceNode } from '../types/type-reference-node.js';
import type { IntrinsicTypeNode } from '../types/intrinsic-type-node.js';
import type { TypePredicateNode } from '../types/type-predicate-node.js';
import type { TypeOperatorNode } from '../types/type-operator-node.js';
import type { OptionalTypeNode } from '../types/optional-type-node.js';
import type { FunctionTypeNode } from '../types/function-type-node.js';
import type { TypeLiteralNode } from '../types/type-literal-node.js';
import type { MappedTypeNode } from '../types/mapped-type-node.js';
import type { UnionTypeNode } from '../types/union-type-node.js';
import type { TupleTypeNode } from '../types/tuple-type-node.js';
import type { TypeAliasNode } from '../nodes/type-alias-node.js';
import type { ArrayTypeNode } from '../types/array-type-node.js';
import type { InferTypeNode } from '../types/infer-type-node.js';
import type { TypeQueryNode } from '../types/type-query-node.js';
import type { InterfaceNode } from '../nodes/interface-node.js';
import type { RestTypeNode } from '../types/rest-type-node.js';
import type { FunctionNode } from '../nodes/function-node.js';
import type { VariableStatementNode } from '../nodes/variable-statement-node.js';
import type { ClassNode } from '../nodes/class-node.js';
import type { EnumNode } from '../nodes/enum-node.js';
import { ImportKind } from '../models/import.js';
import { ExportKind } from '../models/export.js';
import { TypeKind } from '../models/type.js';
import { DeclarationKind } from '../models/declaration.js';
import type { ParenthesizedTypeNode } from '../types/parenthesized-type-node.js';
import type { DeclarationLike, ExportLike, ImportLike } from './types.js';


const declarationKinds = Object.values(DeclarationKind);
const exportKinds = Object.values(ExportKind);
const importKinds = Object.values(ImportKind);
const typeKinds = Object.values(TypeKind);

/**
 * A utility object that has a few type predicate
 * functions available to make life easier when
 * traversing the reflected nodes.
 */
export const is = {
    // IMPORTS
    ImportNode: (node: unknown): node is ImportLike => {
        if (node == null || typeof node !== 'object') {
            return false;
        }

        return 'getKind' in node &&
            typeof node.getKind === 'function' &&
            importKinds.includes(node.getKind());
    },

    DefaultImportNode: (node: unknown): node is DefaultImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Default;
    },

    NamedImportNode: (node: unknown): node is NamedImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Named;
    },

    NamespaceImportNode: (node: unknown): node is NamespaceImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Namespace;
    },

    SideEffectImportNode: (node: unknown): node is SideEffectImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.SideEffect;
    },

    // DECLARATIONS
    DeclarationNode: (node: unknown): node is DeclarationLike => {
        if (node == null || typeof node !== 'object') {
            return false;
        }

        return 'getKind' in node &&
            typeof node.getKind === 'function' &&
            declarationKinds.includes(node.getKind());
    },

    EnumNode: (node: unknown): node is EnumNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Enum;
    },

    VariableNode: (node: unknown): node is VariableStatementNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Variable;
    },

    TypeAliasNode: (node: unknown): node is TypeAliasNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.TypeAlias;
    },

    FunctionNode: (node: unknown): node is FunctionNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Function;
    },

    ClassNode: (node: unknown): node is ClassNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Class;
    },

    InterfaceNode: (node: unknown): node is InterfaceNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Interface;
    },

    // TYPES
    TypeNode: (node: unknown): node is ReflectedType => {
        if (node == null || typeof node !== 'object') {
            return false;
        }

        return 'getKind' in node &&
            typeof node.getKind === 'function' &&
            typeKinds.includes(node.getKind());
    },

    ArrayTypeNode: (node: unknown): node is ArrayTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Array;
    },

    ConditionalTypeNode: (node: unknown): node is ConditionalTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Conditional;
    },

    FunctionTypeNode: (node: unknown): node is FunctionTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Function;
    },

    IndexedAccessTypeNode: (node: unknown): node is IndexedAccessTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.IndexAccess;
    },

    InferTypeNode: (node: unknown): node is InferTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Infer;
    },

    IntersectionTypeNode: (node: unknown): node is IntersectionTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Intersection;
    },

    TypeLiteralTypeNode: (node: unknown): node is TypeLiteralNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.TypeLiteral;
    },

    MappedTypeNode: (node: unknown): node is MappedTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Mapped;
    },

    NamedTupleMemberNode: (node: unknown): node is NamedTupleMemberNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.NamedTupleMember;
    },

    OptionalTypeNode: (node: unknown): node is OptionalTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Optional;
    },

    IntrinsicTypeNode: (node: unknown): node is IntrinsicTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Intrinsic;
    },

    RestTypeNode: (node: unknown): node is RestTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Rest;
    },

    TemplateLiteralTypeNode: (node: unknown): node is TemplateLiteralTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.TemplateLiteral;
    },

    TupleTypeNode: (node: unknown): node is TupleTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Tuple;
    },

    TypeLiteralNode: (node: unknown): node is TypeLiteralNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Literal;
    },

    TypeOperatorNode: (node: unknown): node is TypeOperatorNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Operator;
    },

    TypePredicateNode: (node: unknown): node is TypePredicateNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Predicate;
    },

    TypeQueryNode: (node: unknown): node is TypeQueryNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Query;
    },

    TypeReferenceNode: (node: unknown): node is TypeReferenceNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Reference;
    },

    UnionTypeNode: (node: unknown): node is UnionTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Union;
    },

    ParenthesizedTypeNode: (node: unknown): node is ParenthesizedTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Parenthesized;
    },

    // EXPORTS
    ExportNode: (node: unknown): node is ExportLike => {
        if (node == null || typeof node !== 'object') {
            return false;
        }

        return 'getKind' in node &&
            typeof node.getKind === 'function' &&
            exportKinds.includes(node.getKind());
    },

    DefaultExportNode: (node: unknown): node is ExportAssignmentNode | ExportDeclarationNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Default;
    },

    NamedExportNode: (node: unknown): node is NamedExportNode | ExportDeclarationNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Named;
    },

    EqualExportNode: (node: unknown): node is ExportAssignmentNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Equals;
    },

    NamespaceExportNode: (node: unknown): node is NamespaceExportNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Namespace;
    },

    ReExportNode: (node: unknown): node is ReExportNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Star;
    },
};
