import { Declaration } from '../models/index.js';
import ts from 'typescript';


export function isNamespace(node: ts.Node | undefined): node is ts.ModuleDeclaration {
    return !!(node && ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body));
}

export function tryAddNamespace(node: ts.Node, doc: Declaration): void {
    // The parent is a "ModuleBlock" and the grandfather is the ModuleDeclaration (the namespace)
    if (!isNamespace(node.parent?.parent)) {
        return;
    }

    doc.namespace = node.parent.parent.name?.getText() ?? '';
}
