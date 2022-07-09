import { extractMixinNodes, hasExportKeyword } from '../utils';
import { createVariable } from '../factories/create-variable';
import { createExport } from '../factories/create-export';
import { createImport } from '../factories';
import { Module } from '../models';
import ts from 'typescript';


/**
 * Extracts metadata from the AST node
 *
 * @param rootNode
 * @param moduleDoc
 */
export function visitNode(rootNode: ts.Node | ts.SourceFile, moduleDoc: Module): void {
    if (ts.isImportDeclaration(rootNode)) {
        const imports = createImport(rootNode);
        moduleDoc.imports = [...moduleDoc.imports, ...imports];
        return;
    }

    if (hasExportKeyword(rootNode)) {
        createExport(rootNode, moduleDoc);
    }

    const mixinNodes = extractMixinNodes(rootNode);

    if (mixinNodes !== null) {
        return;
    }

    if (ts.isVariableStatement(rootNode)) {
        createVariable(rootNode, moduleDoc);
        return;
    }

    if (ts.isFunctionDeclaration(rootNode)) {
        return;
    }

    if (ts.isClassDeclaration(rootNode)) {
        return;
    }

    if (ts.isInterfaceDeclaration(rootNode)) {
        return;
    }

    if (ts.isExportDeclaration(rootNode) || ts.isExportAssignment(rootNode)) {
        createExport(rootNode, moduleDoc);
        return;
    }


    ts.forEachChild(rootNode, (node: ts.Node) => visitNode(node, moduleDoc));
}
