import { VariableDeclarationNode } from './variable-declaration-node.js';
import { ExportDeclarationNode } from './export-declaration-node.js';
import { ExportAssignmentNode } from './export-assignment-node.js';
import { NamespaceExportNode } from './namespace-export-node.js';
import { NamespaceImportNode } from './namespace-import-node.js';
import { DeclarationKind } from '../models/declaration-kind.js';
import { DefaultImportNode } from './default-import-node.js';
import { NamedImportNode } from './named-import-node.js';
import { NamedExportNode } from './named-export-node.js';
import { DeclarationNode } from './declaration-node.js';
import { TypeAliasNode } from './type-alias-node.js';
import { ReflectedNode } from './reflected-node.js';
import { ReExportNode } from './re-export-node.js';
import { ImportKind } from '../models/import.js';
import { ExportKind } from '../models/export.js';
import { NodeType } from '../models/node.js';
import { EnumNode } from './enum-node.js';
import ts from 'typescript';


export type ImportNode = DefaultImportNode | NamedImportNode | NamespaceImportNode;

export type ExportStatementNode = NamedExportNode | NamespaceExportNode | ReExportNode;

export type ExportNode = ExportDeclarationNode | ExportAssignmentNode | ExportStatementNode;

export type FunctionLikeNode = ts.VariableStatement
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.PropertyDeclaration
    | ts.PropertySignature;


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
