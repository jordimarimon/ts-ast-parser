import ts from 'typescript';


/**
 * Case of a declaration that has the special keyword `export`:
 *
 *      export const foo = 3;
 *      export function bar() {...}
 *      export class Foo {...}
 *
 */
export function hasExportKeyword(node: ts.Node): node is ts.Node {
    const modifiers = ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : [];

    return modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
}

/**
 * Case of an export declaration like the following:
 *
 *      export default var1;
 *
 */
export function hasDefaultKeyword(node: ts.Node): boolean {
    const modifiers = ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : [];

    return modifiers.some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword);
}
