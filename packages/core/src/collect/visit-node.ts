import { extractMixinNodes, hasExportKeyword, isFunctionDeclaration, shouldIgnore } from '../utils';
import * as fromFactory from '../factories';
import { Module } from '../models';
import ts from 'typescript';


export function visitNode(rootNode: ts.Node | ts.SourceFile, moduleDoc: Module): void {
    if (shouldIgnore(rootNode)) {
        return;
    }

    if (ts.isImportDeclaration(rootNode)) {
        moduleDoc.imports = [
            ...moduleDoc.imports,
            ...fromFactory.createImport(rootNode),
        ];

        return;
    }

    if (hasExportKeyword(rootNode)) {
        fromFactory.createExport(rootNode, moduleDoc);
    }

    const mixinNodes = extractMixinNodes(rootNode);

    if (mixinNodes !== null) {
        // TODO: It's not yet implemented
        return;
    }

    if (isFunctionDeclaration(rootNode)) {
        fromFactory.createFunction(rootNode, moduleDoc);
        return;
    }

    if (ts.isVariableStatement(rootNode)) {
        fromFactory.createVariable(rootNode, moduleDoc);
        return;
    }

    if (ts.isEnumDeclaration(rootNode)) {
        fromFactory.createEnum(rootNode, moduleDoc);
        return;
    }

    if (ts.isTypeAliasDeclaration(rootNode)) {
        fromFactory.createTypeAlias(rootNode, moduleDoc);
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
        fromFactory.createExport(rootNode, moduleDoc);
        return;
    }

    ts.forEachChild(rootNode, (node: ts.Node) => visitNode(node, moduleDoc));
}
