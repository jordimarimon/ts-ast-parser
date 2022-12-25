import { getModifiers } from './modifiers.js';
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
    return getModifiers(node).some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
}

/**
 * Case of an export declaration like the following:
 *
 *      export default var1;
 *
 */
export function hasDefaultKeyword(node: ts.Node): boolean {
    return getModifiers(node).some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword);
}
