import { Module } from './models';
import ts from 'typescript';


/**
 * Extracts metadata from the AST node
 *
 * @param node
 * @param moduleDoc
 */
export function visitNode(node: ts.Node | ts.SourceFile, moduleDoc: Module): void {
    // TODO(Jordi M.): Check the type of node and fill the moduleDoc

    ts.forEachChild(node, () => visitNode(node, moduleDoc));
}
