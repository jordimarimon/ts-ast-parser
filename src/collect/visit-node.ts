import { extractMixinNodes, hasExportKeyword, isCustomElementsDefineCall, shouldIgnore } from '../utils';
import { createExport, createImport, createVariable } from '../factories';
import { Module } from '../models';
import ts from 'typescript';


/**
 * Extracts metadata from the AST node
 *
 * @param rootNode
 * @param moduleDoc
 */
export function visitNode(rootNode: ts.Node | ts.SourceFile, moduleDoc: Module): void {
    if (shouldIgnore(rootNode)) {
        return;
    }

    if (ts.isImportDeclaration(rootNode)) {
        moduleDoc.imports = [
            ...moduleDoc.imports,
            ...createImport(rootNode),
        ];

        return;
    }

    if (hasExportKeyword(rootNode)) {
        createExport(rootNode, moduleDoc);
    }

    const mixinNodes = extractMixinNodes(rootNode);

    if (mixinNodes !== null) {
        // TODO: It's not yet implemented
        return;
    }

    if (ts.isVariableStatement(rootNode)) {
        createVariable(rootNode, moduleDoc);
        return;
    }

    if (ts.isFunctionDeclaration(rootNode)) {
        // TODO: It's not yet implemented
        return;
    }

    if (ts.isClassDeclaration(rootNode)) {
        // TODO: It's not yet implemented
        return;
    }

    if (ts.isInterfaceDeclaration(rootNode)) {
        // TODO: It's not yet implemented
        return;
    }

    if (ts.isExportDeclaration(rootNode) || ts.isExportAssignment(rootNode)) {
        createExport(rootNode, moduleDoc);
        return;
    }

    if (ts.isExpressionStatement(rootNode) && isCustomElementsDefineCall(rootNode)) {
        // TODO: It's not yet implemented
        return;
    }


    ts.forEachChild(rootNode, (node: ts.Node) => visitNode(node, moduleDoc));
}
