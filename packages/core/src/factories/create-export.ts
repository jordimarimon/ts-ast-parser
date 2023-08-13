import { ExportDeclarationNode } from '../nodes/export-declaration-node.js';
import { ExportAssignmentNode } from '../nodes/export-assignment-node.js';
import { NamespaceExportNode } from '../nodes/namespace-export-node.js';
import { NamedExportNode } from '../nodes/named-export-node.js';
import type { AnalyserContext } from '../analyser-context.js';
import type { ExportStatementNode } from '../utils/is.js';
import { ReExportNode } from '../nodes/re-export-node.js';
import { hasExportKeyword } from '../utils/export.js';
import type { NodeFactory } from './node-factory.js';
import type { Export } from '../models/export.js';
import ts from 'typescript';


export const exportDeclarationFactory: NodeFactory<Export, ExportDeclarationNode, ts.Node> = {

    isNode: (node: ts.Node): node is ts.Node => hasExportKeyword(node),

    create: (node: ts.Node, context: AnalyserContext): ExportDeclarationNode[] => {
        const exports: ExportDeclarationNode[] = [];

        if (ts.isVariableStatement(node)) {
            for (const declaration of node.declarationList.declarations) {
                exports.push(new ExportDeclarationNode(node, context, declaration));
            }
        }

        if (
            ts.isFunctionDeclaration(node) ||
            ts.isClassDeclaration(node) ||
            ts.isInterfaceDeclaration(node) ||
            ts.isEnumDeclaration(node) ||
            ts.isTypeAliasDeclaration(node)
        ) {
            exports.push(new ExportDeclarationNode(node, context));
        }

        return exports;
    },

};

export const exportAssignmentFactory: NodeFactory<Export, ExportAssignmentNode, ts.ExportAssignment> = {

    isNode: (node: ts.Node): node is ts.ExportAssignment => ts.isExportAssignment(node),

    create: (node: ts.ExportAssignment, context: AnalyserContext): ExportAssignmentNode[] => {
        return [new ExportAssignmentNode(node, context)];
    },

};

export const exportStatementFactory: NodeFactory<Export, ExportStatementNode, ts.ExportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ExportDeclaration => ts.isExportDeclaration(node),

    create: (node: ts.ExportDeclaration, context: AnalyserContext): ExportStatementNode[] => {
        const isNamed = node.exportClause && ts.isNamedExports(node.exportClause);
        const isNamespaced = node.exportClause && ts.isNamespaceExport(node.exportClause);
        const isReexport = node?.moduleSpecifier !== undefined;
        const result: (NamedExportNode | NamespaceExportNode | ReExportNode)[] = [];

        if (isNamed) {
            for (const element of node.exportClause.elements) {
                result.push(new NamedExportNode(node, element, context));
            }
        } else if (isNamespaced) {
            result.push(new NamespaceExportNode(node, context));
        } else if (isReexport) {
            result.push(new ReExportNode(node, context));
        }

        return result;
    },

};
