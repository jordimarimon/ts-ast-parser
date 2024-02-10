import type { DefaultImportNode } from '../nodes/default-import-node.js';
import type { NamedImportNode } from '../nodes/named-import-node.js';
import type { NamespaceImportNode } from '../nodes/namespace-import-node.js';
import type { SideEffectImportNode } from '../nodes/side-effect-import-node.js';
import type { NamedExportNode } from '../nodes/named-export-node.js';
import type { NamespaceExportNode } from '../nodes/namespace-export-node.js';
import type { ReExportNode } from '../nodes/re-export-node.js';
import type { ExportDeclarationNode } from '../nodes/export-declaration-node.js';
import type { ExportAssignmentNode } from '../nodes/export-assignment-node.js';
import type ts from 'typescript';


export type ImportNode = DefaultImportNode | NamedImportNode | NamespaceImportNode | SideEffectImportNode;

export type ExportStatementNode = NamedExportNode | NamespaceExportNode | ReExportNode;

export type ExportNode = ExportDeclarationNode | ExportAssignmentNode | ExportStatementNode;

export type NodeWithFunctionDeclaration =
    | ts.VariableStatement
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.MethodSignature
    | ts.PropertyDeclaration
    | ts.PropertySignature;

export type FunctionLikeNode =
    | ts.FunctionDeclaration
    | ts.ArrowFunction
    | ts.MethodSignature
    | ts.FunctionExpression
    | ts.FunctionTypeNode
    | ts.MethodDeclaration;

export type PropertyLikeNode =
    | ts.PropertyDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration;

export type ClassLikeNode = ts.ClassDeclaration | ts.ClassExpression;

export type InterfaceOrClassDeclaration = ClassLikeNode | ts.InterfaceDeclaration;

export type NamedNodeName = ts.Identifier | ts.PrivateIdentifier | ts.ComputedPropertyName;

export interface SymbolWithLocation {
    path: string;
    line: number | null;
    symbol: ts.Symbol | undefined | null;
}

export interface SymbolWithContext {
    symbol: ts.Symbol | undefined | null;
    type: ts.Type | undefined | null;
    overrides?: boolean;
    inherited?: boolean;
}

// This is not a complete definition of what a "package.json"
// has, but rather only the properties that we need.
export interface PackageJson {
    [field: string]: unknown;
    readonly main?: string;
    readonly name?: string;
    readonly types?: string;
    readonly version?: string;
}
