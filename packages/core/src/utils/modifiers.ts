import { isTS4_8 } from './version.js';
import ts from 'typescript';

export function getModifiers(node: ts.Node): readonly ts.Modifier[] {
    if (isTS4_8()) {
        return ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : [];
    }

    // We need to use the assertion because TS removed the property in newer versions
    return Array.from((node as unknown as { modifiers: readonly ts.Modifier[] }).modifiers ?? []);
}
