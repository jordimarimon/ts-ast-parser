import { collectImports } from './imports';
import { Module } from '../models';
import ts from 'typescript';


/**
 * Extracts metadata from the AST node
 *
 * @param rootNode
 * @param moduleDoc
 */
export function visitNode(rootNode: ts.Node | ts.SourceFile, moduleDoc: Module): void {
    const imports = collectImports(rootNode);
    moduleDoc.imports = [...moduleDoc.imports, ...imports];

    ts.forEachChild(rootNode, (node: ts.Node) => visitNode(node, moduleDoc));
}
