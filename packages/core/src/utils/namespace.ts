import { Declaration } from '../models/declaration.js';
import ts from 'typescript';


export function isNamespace(node: ts.Node | undefined): node is ts.ModuleDeclaration {
    return !!(node && ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body));
}

export function getNamespaceName(node: ts.ModuleDeclaration): string {
    const path: string[] = [
        node.name?.getText() ?? '',
    ];

    let currNode = node;

    while (isNamespace(currNode.parent?.parent)) {
        path.push(currNode.parent.parent.name?.getText() ?? '');
        currNode = currNode.parent.parent;
    }

    return path.reverse().join('.');
}

export function tryAddNamespace(node: ts.Node, doc: Declaration): void {
    // The parent is a "ModuleBlock" and the grandfather is the ModuleDeclaration (the namespace)
    if (!isNamespace(node.parent?.parent)) {
        return;
    }

    doc.namespace = getNamespaceName(node.parent.parent);
}
