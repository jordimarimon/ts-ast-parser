import { ts4_8 } from '../@types/typescript/index.js';
import { isTS4_8 } from './version.js';
import ts from 'typescript';


export function getModifiers(node: ts.Node): readonly ts.Modifier[] {
    if (isTS4_8()) {
        const _ts = (ts as unknown as typeof ts4_8);
        return _ts.canHaveModifiers(node) ? (_ts.getModifiers(node) ?? []) : [];
    }

    return Array.from(node.modifiers ?? []) as ts.Modifier[];
}
