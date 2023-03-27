import { isTS4_8 } from './version.js';
import ts from 'typescript';


export function getDecorators(node: ts.Node): readonly ts.Decorator[] {
    let nodeDecorators: readonly ts.Decorator[];

    if (isTS4_8()) {
        nodeDecorators = ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
    } else {
        nodeDecorators = node.decorators ?? [];
    }

    return nodeDecorators;
}
