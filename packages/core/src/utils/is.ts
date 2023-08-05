import type { ExportDeclarationNode } from '../nodes/export-declaration-node.js';
import type { SideEffectImportNode } from '../nodes/side-effect-import-node.js';
import type { ExportAssignmentNode } from '../nodes/export-assignment-node.js';
import type { NamespaceExportNode } from '../nodes/namespace-export-node.js';
import type { NamespaceImportNode } from '../nodes/namespace-import-node.js';
import type { DefaultImportNode } from '../nodes/default-import-node.js';
import type { NamedImportNode } from '../nodes/named-import-node.js';
import type { NamedExportNode } from '../nodes/named-export-node.js';
import type { DeclarationNode } from '../nodes/declaration-node.js';
import type { TypeAliasNode } from '../nodes/type-alias-node.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import type { ReflectedNode } from '../nodes/reflected-node.js';
import type { InterfaceNode } from '../nodes/interface-node.js';
import type { ReExportNode } from '../nodes/re-export-node.js';
import type { FunctionNode } from '../nodes/function-node.js';
import type { VariableNode } from '../nodes/variable-node.js';
import type { ClassNode } from '../nodes/class-node.js';
import type { EnumNode } from '../nodes/enum-node.js';
import { ImportKind } from '../models/import.js';
import { ExportKind } from '../models/export.js';
import { NodeType } from '../models/node.js';
import type ts from 'typescript';


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

export type SymbolWithDeclaration<T extends ts.Declaration = ts.Declaration> = {
    symbol: ts.Symbol;
    declaration: T;
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
    ImportNode: (node: ReflectedNode): node is ImportNode => {
        return node.getNodeType() === NodeType.Import;
    },

    DefaultImportNode: (node: ReflectedNode): node is DefaultImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Default;
    },

    NamedImportNode: (node: ReflectedNode): node is NamedImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Named;
    },

    NamespaceImportNode: (node: ReflectedNode): node is NamespaceImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Namespace;
    },

    SideEffectImportNode: (node: ReflectedNode): node is SideEffectImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.SideEffect;
    },

    // DECLARATIONS
    DeclarationNode: (node: ReflectedNode): node is DeclarationNode => {
        return node.getNodeType() === NodeType.Declaration;
    },

    EnumNode: (node: ReflectedNode): node is EnumNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Enum;
    },

    VariableNode: (node: ReflectedNode): node is VariableNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Variable;
    },

    TypeAliasNode: (node: ReflectedNode): node is TypeAliasNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.TypeAlias;
    },

    FunctionNode: (node: ReflectedNode): node is FunctionNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Function;
    },

    ClassNode: (node: ReflectedNode): node is ClassNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Class;
    },

    InterfaceNode: (node: ReflectedNode): node is InterfaceNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Interface;
    },

    // EXPORTS
    ExportNode: (node: ReflectedNode): node is ExportNode => {
        return node.getNodeType() === NodeType.Export;
    },

    DefaultExportNode: (node: ReflectedNode): node is ExportAssignmentNode | ExportDeclarationNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Default;
    },

    NamedExportNode: (node: ReflectedNode): node is NamedExportNode | ExportDeclarationNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Named;
    },

    EqualExportNode: (node: ReflectedNode): node is ExportAssignmentNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Equals;
    },

    NamespaceExportNode: (node: ReflectedNode): node is NamespaceExportNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Namespace;
    },

    ReExportNode: (node: ReflectedNode): node is ReExportNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Star;
    },

};
