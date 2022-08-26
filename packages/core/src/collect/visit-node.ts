import { shouldIgnore } from '../utils/index.js';
import factories from '../factories/index.js';
import { Module } from '../models/index.js';
import ts from 'typescript';


export function visitNode(rootNode: ts.Node | ts.SourceFile, moduleDoc: Module): void {
    if (shouldIgnore(rootNode)) {
        return;
    }

    for (const factory of factories) {
        if (factory.isNode(rootNode)) {
            // @ts-expect-error TypeScript is unable to detect that the
            // node has the correct types
            factory.create(rootNode, moduleDoc);
        }
    }

    ts.forEachChild(rootNode, (node: ts.Node) => visitNode(node, moduleDoc));
}
