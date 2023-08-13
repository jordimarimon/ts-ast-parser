import { getModifiers } from './modifiers.js';
import ts from 'typescript';

/**
 * Checks if a declaration has the special keyword `export`.
 *
 * For example:
 *
 *      export const foo = 3;
 *      export function bar() {...}
 *      export class Foo {...}
 *
 * @param node - The node to check
 *
 * @returns True if the node has the `export` keyword
 */
export function hasExportKeyword(node: ts.Node): boolean {
    return getModifiers(node).some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
}

/**
 * Checks if a declaration is the default export.
 *
 * For example:
 *
 *      export default var1;
 *
 * @param node - The node to check
 *
 * @returns True if the node is the default export
 */
export function hasDefaultKeyword(node: ts.Node): boolean {
    return getModifiers(node).some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword);
}
