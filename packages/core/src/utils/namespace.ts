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

export function getNamespace(node: ts.Node): string {
    // The parent is a "ModuleBlock" and the grandfather is the ModuleDeclaration (the namespace)
    if (!isNamespace(node.parent?.parent)) {
        return '';
    }

    return getNamespaceName(node.parent.parent);
}
