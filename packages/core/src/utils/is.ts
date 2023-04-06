import { VariableDeclarationNode } from '../nodes/variable-declaration-node.js';
import { ExportDeclarationNode } from '../nodes/export-declaration-node.js';
import { ExportAssignmentNode } from '../nodes/export-assignment-node.js';
import { NamespaceExportNode } from '../nodes/namespace-export-node.js';
import { NamespaceImportNode } from '../nodes/namespace-import-node.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { DefaultImportNode } from '../nodes/default-import-node.js';
import { NamedImportNode } from '../nodes/named-import-node.js';
import { NamedExportNode } from '../nodes/named-export-node.js';
import { DeclarationNode } from '../nodes/declaration-node.js';
import { TypeAliasNode } from '../nodes/type-alias-node.js';
import { ReflectedNode } from '../nodes/reflected-node.js';
import { ReExportNode } from '../nodes/re-export-node.js';
import { ImportKind } from '../models/import.js';
import { ExportKind } from '../models/export.js';
import { NodeType } from '../models/node.js';
import { EnumNode } from '../nodes/enum-node.js';
import ts from 'typescript';


export type ImportNode = DefaultImportNode | NamedImportNode | NamespaceImportNode;

export type ExportStatementNode = NamedExportNode | NamespaceExportNode | ReExportNode;

export type ExportNode = ExportDeclarationNode | ExportAssignmentNode | ExportStatementNode;

export type FunctionLikeNode = ts.VariableStatement
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.PropertyDeclaration
    | ts.PropertySignature;

export type FunctionLikeDeclaration = ts.FunctionDeclaration |
    ts.ArrowFunction |
    ts.MethodSignature |
    ts.FunctionExpression |
    ts.FunctionTypeNode |
    ts.MethodDeclaration |
    null;

export type GeneratorFunction = ts.FunctionDeclaration | ts.FunctionExpression | ts.MethodDeclaration;

export type InterfaceOrClassDeclaration = ts.ClassDeclaration | ts.ClassExpression | ts.InterfaceDeclaration;

export type NodeWithTypeParameter = ts.TypeAliasDeclaration |
    ts.InterfaceDeclaration |
    ts.ClassDeclaration |
    ts.ClassExpression |
    ts.SignatureDeclaration |
    FunctionLikeDeclaration |
    null;

export type NodeWithParameters = FunctionLikeDeclaration |
    ts.SetAccessorDeclaration |
    ts.SignatureDeclaration |
    ts.ConstructorDeclaration;

export type NodeWithHeritageClause = ts.InterfaceDeclaration | ts.ClassDeclaration | ts.ClassExpression;

export type SymbolWithLocation = {
    path: string;
    line: number | null;
    symbol: ts.Symbol | undefined;
};

export type SymbolWithContextType = {
    symbol: ts.Symbol | undefined;
    type: ts.Type | undefined;
    overrides?: boolean;
    inherited?: boolean;
};


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

    // DECLARATIONS
    DeclarationNode: (node: ReflectedNode): node is DeclarationNode => {
        return node.getNodeType() === NodeType.Declaration;
    },

    EnumNode: (node: ReflectedNode): node is EnumNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Enum;
    },

    VariableNode: (node: ReflectedNode): node is VariableDeclarationNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Variable;
    },

    TypeAliasNode: (node: ReflectedNode): node is TypeAliasNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.TypeAlias;
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
