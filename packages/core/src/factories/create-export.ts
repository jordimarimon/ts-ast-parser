import { ExportDeclarationNode } from '../nodes/export-declaration-node.js';
import { ExportAssignmentNode } from '../nodes/export-assignment-node.js';
import { NamespaceExportNode } from '../nodes/namespace-export-node.js';
import { NamedExportNode } from '../nodes/named-export-node.js';
import { ReExportNode } from '../nodes/re-export-node.js';
import { hasExportKeyword } from '../utils/export.js';
import { ExportStatementNode } from '../nodes/is.js';
import { NodeFactory } from './node-factory.js';
import { Export } from '../models/export.js';
import ts from 'typescript';


export const exportDeclarationFactory: NodeFactory<Export, ExportDeclarationNode, ts.Node> = {

    isNode: hasExportKeyword,

    create: (node: ts.Node): ExportDeclarationNode[] => {
        const exports: ExportDeclarationNode[] = [];

        if (ts.isVariableStatement(node)) {
            for (const declaration of node.declarationList.declarations) {
                exports.push(new ExportDeclarationNode(node, declaration));
            }
        }

        if (
            ts.isFunctionDeclaration(node) ||
            ts.isClassDeclaration(node) ||
            ts.isInterfaceDeclaration(node) ||
            ts.isEnumDeclaration(node) ||
            ts.isTypeAliasDeclaration(node)
        ) {
            exports.push(new ExportDeclarationNode(node));
        }

        return exports;
    },

};

export const exportAssignmentFactory: NodeFactory<Export, ExportAssignmentNode, ts.ExportAssignment> = {

    isNode: (node: ts.Node): node is ts.ExportAssignment => ts.isExportAssignment(node),

    create: (node: ts.ExportAssignment): ExportAssignmentNode[] => [new ExportAssignmentNode(node)],

};

export const exportStatementFactory: NodeFactory<Export, ExportStatementNode, ts.ExportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ExportDeclaration => ts.isExportDeclaration(node),

    create: (node: ts.ExportDeclaration): ExportStatementNode[] => {
        const isNamed = node.exportClause && ts.isNamedExports(node.exportClause);
        const isNamespaced = node.exportClause && ts.isNamespaceExport(node.exportClause);
        const isReexport = node?.moduleSpecifier !== undefined;
        const result: (NamedExportNode | NamespaceExportNode | ReExportNode)[] = [];

        if (isNamed) {
            for (const element of node.exportClause.elements) {
                result.push(new NamedExportNode(node, element));
            }
        } else if (isNamespaced) {
            result.push(new NamespaceExportNode(node));
        } else if (isReexport) {
            result.push(new ReExportNode(node));
        }

        return result;
    },

};
