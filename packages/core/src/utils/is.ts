import type { ReflectedRootNode, ReflectedTypeNode } from '../nodes/reflected-node.js';
import type { ExportDeclarationNode } from '../nodes/export-declaration-node.js';
import type { SideEffectImportNode } from '../nodes/side-effect-import-node.js';
import type { ExportAssignmentNode } from '../nodes/export-assignment-node.js';
import type { IntersectionTypeNode } from '../nodes/intersection-type-node.js';
import type { NamespaceExportNode } from '../nodes/namespace-export-node.js';
import type { NamespaceImportNode } from '../nodes/namespace-import-node.js';
import type { ConditionalTypeNode } from '../nodes/conditional-type-node.js';
import type { TypeReferenceNode } from '../nodes/type-reference-node.js';
import type { PrimitiveTypeNode } from '../nodes/primitive-type-node.js';
import type { DefaultImportNode } from '../nodes/default-import-node.js';
import type { TypeOperatorNode } from '../nodes/type-operator-node.js';
import type { NamedImportNode } from '../nodes/named-import-node.js';
import type { NamedExportNode } from '../nodes/named-export-node.js';
import type { TypeLiteralNode } from '../nodes/type-literal-node.js';
import type { UnknownTypeNode } from '../nodes/unknown-type-node.js';
import type { UnionTypeNode } from '../nodes/union-type-node.js';
import type { TupleTypeNode } from '../nodes/tuple-type-node.js';
import type { TypeAliasNode } from '../nodes/type-alias-node.js';
import type { ArrayTypeNode } from '../nodes/array-type-node.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import type { InterfaceNode } from '../nodes/interface-node.js';
import type { ReExportNode } from '../nodes/re-export-node.js';
import type { FunctionNode } from '../nodes/function-node.js';
import type { VariableNode } from '../nodes/variable-node.js';
import type { ClassNode } from '../nodes/class-node.js';
import type { EnumNode } from '../nodes/enum-node.js';
import { ImportKind } from '../models/import.js';
import { ExportKind } from '../models/export.js';
import { RootNodeType } from '../models/node.js';
import { TypeKind } from '../models/type.js';
import type ts from 'typescript';
import type { DeclarationNode } from '../nodes/declaration-node.js';


export type ImportNode = DefaultImportNode | NamedImportNode | NamespaceImportNode | SideEffectImportNode;

export type ExportStatementNode = NamedExportNode | NamespaceExportNode | ReExportNode;

export type ExportNode = ExportDeclarationNode | ExportAssignmentNode | ExportStatementNode;

export type NodeWithFunctionDeclaration = ts.VariableStatement
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.MethodSignature
    | ts.PropertyDeclaration
    | ts.PropertySignature;

export type FunctionLikeNode = ts.FunctionDeclaration |
    ts.ArrowFunction |
    ts.MethodSignature |
    ts.FunctionExpression |
    ts.FunctionTypeNode |
    ts.MethodDeclaration;

export type PropertyLikeNode = ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration;

export type ClassLikeNode = ts.ClassDeclaration | ts.ClassExpression;

export type InterfaceOrClassDeclaration = ClassLikeNode | ts.InterfaceDeclaration;

export type SymbolWithLocation = {
    path: string;
    line: number | null;
    symbol: ts.Symbol | undefined;
};

export type SymbolWithContext = {
    symbol: ts.Symbol | undefined;
    type: ts.Type | undefined;
    overrides?: boolean;
    inherited?: boolean;
};


/**
 * A utility object that has a few type predicate functions available to make life easier when
 * traversing the reflected nodes.
 */
export const is = {

    // IMPORTS
    ImportNode: (node: ReflectedRootNode): node is ImportNode => {
        return node.getNodeType() === RootNodeType.Import;
    },

    DefaultImportNode: (node: ReflectedRootNode): node is DefaultImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Default;
    },

    NamedImportNode: (node: ReflectedRootNode): node is NamedImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Named;
    },

    NamespaceImportNode: (node: ReflectedRootNode): node is NamespaceImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Namespace;
    },

    SideEffectImportNode: (node: ReflectedRootNode): node is SideEffectImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.SideEffect;
    },

    // DECLARATIONS
    DeclarationNode: (node: ReflectedRootNode): node is DeclarationNode => {
        return node.getNodeType() === RootNodeType.Declaration;
    },

    EnumNode: (node: ReflectedRootNode): node is EnumNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Enum;
    },

    VariableNode: (node: ReflectedRootNode): node is VariableNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Variable;
    },

    TypeAliasNode: (node: ReflectedRootNode): node is TypeAliasNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.TypeAlias;
    },

    FunctionNode: (node: ReflectedRootNode): node is FunctionNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Function;
    },

    ClassNode: (node: ReflectedRootNode): node is ClassNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Class;
    },

    InterfaceNode: (node: ReflectedRootNode): node is InterfaceNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Interface;
    },

    // TYPES
    ArrayTypeNode: (node: ReflectedTypeNode): node is ArrayTypeNode => {
        return node.getKind() === TypeKind.Array;
    },

    ConditionalTypeNode: (node: ReflectedTypeNode): node is ConditionalTypeNode => {
        return node.getKind() === TypeKind.Conditional;
    },

    IntersectionTypeNode: (node: ReflectedTypeNode): node is IntersectionTypeNode => {
        return node.getKind() === TypeKind.Intersection;
    },

    LiteralTypeNode: (node: ReflectedTypeNode): node is TypeLiteralNode => {
        return node.getKind() === TypeKind.ObjectLiteral;
    },

    PrimitiveTypeNode: (node: ReflectedTypeNode): node is PrimitiveTypeNode => {
        return node.getKind() === TypeKind.Primitive;
    },

    TupleTypeNode: (node: ReflectedTypeNode): node is TupleTypeNode => {
        return node.getKind() === TypeKind.Tuple;
    },

    TypeOperatorNode: (node: ReflectedTypeNode): node is TypeOperatorNode => {
        return node.getKind() === TypeKind.Operator;
    },

    TypeReferenceNode: (node: ReflectedTypeNode): node is TypeReferenceNode => {
        return node.getKind() === TypeKind.Reference;
    },

    UnionTypeNode: (node: ReflectedTypeNode): node is UnionTypeNode => {
        return node.getKind() === TypeKind.Union;
    },

    UnknownTypeNode: (node: ReflectedTypeNode): node is UnknownTypeNode => {
        return node.getKind() === TypeKind.Unknown;
    },

    // EXPORTS
    ExportNode: (node: ReflectedRootNode): node is ExportNode => {
        return node.getNodeType() === RootNodeType.Export;
    },

    DefaultExportNode: (node: ReflectedRootNode): node is ExportAssignmentNode | ExportDeclarationNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Default;
    },

    NamedExportNode: (node: ReflectedRootNode): node is NamedExportNode | ExportDeclarationNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Named;
    },

    EqualExportNode: (node: ReflectedRootNode): node is ExportAssignmentNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Equals;
    },

    NamespaceExportNode: (node: ReflectedRootNode): node is NamespaceExportNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Namespace;
    },

    ReExportNode: (node: ReflectedRootNode): node is ReExportNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Star;
    },

};
