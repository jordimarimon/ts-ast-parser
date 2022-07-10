import ts from 'typescript';


export function hasExportKeyword(node: ts.Node): boolean {
    return !!node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
}

export function hasDefaultKeyword(node: ts.Node): boolean {
    return !!node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword);
}

/**
 * Case of an export declaration like the following:
 *
 *      export { var1, var2 } from 'foo';
 *
 * @param node
 *
 */
export function isReexport(node: ts.ExportDeclaration): boolean {
    return node?.moduleSpecifier !== undefined;
}
