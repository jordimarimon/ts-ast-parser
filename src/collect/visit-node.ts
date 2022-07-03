import { createImports } from '../factories';
import { extractMixinNodes } from '../utils';
import { Module } from '../models';
import ts from 'typescript';
import { createVariable } from '../factories/create-variable';


/**
 * Extracts metadata from the AST node
 *
 * @param rootNode
 * @param moduleDoc
 */
export function visitNode(rootNode: ts.Node | ts.SourceFile, moduleDoc: Module): void {
    if (ts.isImportDeclaration(rootNode)) {
        const imports = createImports(rootNode);
        moduleDoc.imports = [...moduleDoc.imports, ...imports];
        return;
    }

    if (ts.isVariableStatement(rootNode)) {
        const mixinNodes = extractMixinNodes(rootNode);

        if (mixinNodes) {
            createVariable(rootNode, moduleDoc);
        }

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


    ts.forEachChild(rootNode, (node: ts.Node) => visitNode(node, moduleDoc));
}
