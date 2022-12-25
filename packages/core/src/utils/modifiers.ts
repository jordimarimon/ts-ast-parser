import { isTS4_8 } from './version.js';
import ts from 'typescript';


export function getModifiers(node: ts.Node): readonly ts.Modifier[] {
    if (isTS4_8()) {
        return ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : [];
    }

    return Array.from(node.modifiers ?? []) as ts.Modifier[];
}
