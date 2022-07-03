import { Module } from '../models';
import ts from 'typescript';


/**
 * Extracts metadata from the AST node
 *
 * @param rootNode
 * @param moduleDoc
 */
export function visitNode(rootNode: ts.Node | ts.SourceFile, moduleDoc: Module): void {
    // TODO(Jordi M.): Check the type of node and fill the moduleDoc

    ts.forEachChild(rootNode, (node) => visitNode(node, moduleDoc));
}
