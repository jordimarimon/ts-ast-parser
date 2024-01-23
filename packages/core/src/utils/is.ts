import type { TemplateLiteralTypeNode } from '../types/template-literal-type-node.js';
import type { IndexedAccessTypeNode } from '../types/indexed-access-type-node.js';
import type { ReflectedTypeNode } from '../reflected-node.js';
import type { ExportDeclarationNode } from '../nodes/export-declaration-node.js';
import type { NamedTupleMemberNode } from '../types/named-tuple-member-node.js';
import type { SideEffectImportNode } from '../nodes/side-effect-import-node.js';
import type { ExportAssignmentNode } from '../nodes/export-assignment-node.js';
import type { IntersectionTypeNode } from '../types/intersection-type-node.js';
import type { NamespaceExportNode } from '../nodes/namespace-export-node.js';
import type { NamespaceImportNode } from '../nodes/namespace-import-node.js';
import type { ConditionalTypeNode } from '../types/conditional-type-node.js';
import type { TypeReferenceNode } from '../types/type-reference-node.js';
import type { IntrinsicTypeNode } from '../types/intrinsic-type-node.js';
import type { DefaultImportNode } from '../nodes/default-import-node.js';
import type { TypePredicateNode } from '../types/type-predicate-node.js';
import type { TypeOperatorNode } from '../types/type-operator-node.js';
import type { OptionalTypeNode } from '../types/optional-type-node.js';
import type { FunctionTypeNode } from '../types/function-type-node.js';
import type { NamedImportNode } from '../nodes/named-import-node.js';
import type { NamedExportNode } from '../nodes/named-export-node.js';
import type { TypeLiteralNode } from '../types/type-literal-node.js';
import type { UnknownTypeNode } from '../types/unknown-type-node.js';
import type { DeclarationNode } from '../nodes/declaration-node.js';
import type { MappedTypeNode } from '../types/mapped-type-node.js';
import type { UnionTypeNode } from '../types/union-type-node.js';
import type { TupleTypeNode } from '../types/tuple-type-node.js';
import type { TypeAliasNode } from '../nodes/type-alias-node.js';
import type { ArrayTypeNode } from '../types/array-type-node.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import type { InferTypeNode } from '../types/infer-type-node.js';
import type { TypeQueryNode } from '../types/type-query-node.js';
import type { InterfaceNode } from '../nodes/interface-node.js';
import type { ReExportNode } from '../nodes/re-export-node.js';
import type { RestTypeNode } from '../types/rest-type-node.js';
import type { FunctionNode } from '../nodes/function-node.js';
import type { VariableNode } from '../nodes/variable-node.js';
import type { ClassNode } from '../nodes/class-node.js';
import type { EnumNode } from '../nodes/enum-node.js';
import { ImportKind } from '../models/import.js';
import { ExportKind } from '../models/export.js';
import { RootNodeType } from '../models/node.js';
import { TypeKind } from '../models/type.js';
import type { ExportNode, ImportNode } from './types.js';


/**
 * A utility object that has a few type predicate
 * functions available to make life easier when
 * traversing the reflected nodes.
 */
export const is = {
    // IMPORTS
    ImportNode: (node: unknown): node is ImportNode => {
        if (node == null || typeof node !== 'object') {
            return false;
        }

        return 'getNodeType' in node &&
            typeof node.getNodeType === 'function' &&
            node.getNodeType() === RootNodeType.Import;
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
    DeclarationNode: (node: unknown): node is DeclarationNode => {
        if (node == null || typeof node !== 'object') {
            return false;
        }

        return 'getNodeType' in node &&
            typeof node.getNodeType === 'function' &&
            node.getNodeType() === RootNodeType.Declaration;
    },

    EnumNode: (node: unknown): node is EnumNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Enum;
    },

    VariableNode: (node: unknown): node is VariableNode => {
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
    TypeNode: (node: unknown): node is ReflectedTypeNode => {
        if (node == null || typeof node !== 'object') {
            return false;
        }

        return 'getKind' in node && typeof node.getKind === 'function';
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

    UnknownTypeNode: (node: unknown): node is UnknownTypeNode => {
        return is.TypeNode(node) && node.getKind() === TypeKind.Unknown;
    },

    // EXPORTS
    ExportNode: (node: unknown): node is ExportNode => {
        if (node == null || typeof node !== 'object') {
            return false;
        }

        return 'getNodeType' in node &&
            typeof node.getNodeType === 'function' &&
            node.getNodeType() === RootNodeType.Export;
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
