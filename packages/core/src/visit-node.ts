import factories from './factories/index.js';
import { Module } from './models/index.js';
import ts from 'typescript';


export function visitNode(rootNode: ts.Node | ts.SourceFile, moduleDoc: Module): void {

    for (const factory of factories) {
        if (factory.isNode(rootNode)) {
            factory.create(rootNode, moduleDoc);
        }
    }

    ts.forEachChild(rootNode, (node: ts.Node) => visitNode(node, moduleDoc));

}
