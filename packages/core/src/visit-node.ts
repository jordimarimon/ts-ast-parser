import { hasExportKeyword, isNamespace } from './utils/index.js';
import factories from './factories/index.js';
import { Module } from './models/index.js';
import ts from 'typescript';


export function visitNode(rootNode: ts.Node | ts.SourceFile, moduleDoc: Module): void {

    // TODO(Jordi M.): Find a better way to deal with namespaces
    if (isNamespace(rootNode) && hasExportKeyword(rootNode)) {
        (rootNode.body as ts.ModuleBlock).statements.forEach(s => visitNode(s, moduleDoc));
        return;
    }

    for (const factory of factories) {
        if (factory.isNode(rootNode)) {
            factory.create(rootNode, moduleDoc);
        }
    }

    ts.forEachChild(rootNode, (node: ts.Node) => visitNode(node, moduleDoc));

}
