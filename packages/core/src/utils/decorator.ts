import { isTS4_8 } from './version.js';
import ts from 'typescript';


/**
 * Returns the decorators defined in the node. An empty array is returned if no decorators are found.
 *
 * @param node - The node to get the decorators from
 * @returns An array of decorators
 */
export function getDecorators(node: ts.Node): readonly ts.Decorator[] {
    let nodeDecorators: readonly ts.Decorator[];

    if (isTS4_8()) {
        nodeDecorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) ?? [] : [];
    } else {
        // We need to use the assertion because TS removed the property in newer versions
        nodeDecorators = (node as unknown as { decorators: readonly ts.Decorator[] }).decorators ?? [];
    }

    return nodeDecorators;
}
