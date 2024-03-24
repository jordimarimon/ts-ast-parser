import { hasFlag } from './has-flag.js';
import { isTS4_8 } from './version.js';
import ts from 'typescript';


/**
 *
 * @param node
 */
export function getModifiers(node: ts.Node): readonly ts.Modifier[] {
    if (isTS4_8()) {
        return ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : [];
    }

    // We need to use the assertion because TS removed the property in newer versions
    return Array.from((node as unknown as { modifiers: readonly ts.Modifier[] }).modifiers ?? []);
}

export function isReadOnly(node: ts.Node | undefined): boolean {
    if (!node || !getModifiers(node).length) {
        return false;
    }

    return hasFlag(ts.getCombinedModifierFlags(node as ts.Declaration), ts.ModifierFlags.Readonly);
}

export function isOptional(symbol: ts.Symbol | undefined | null): boolean {
    return !!symbol && hasFlag(symbol.flags, ts.SymbolFlags.Optional);
}

export function isStatic(node: ts.Node | undefined): boolean {
    if (!node || !getModifiers(node).length) {
        return false;
    }

    return hasFlag(ts.getCombinedModifierFlags(node as ts.Declaration), ts.ModifierFlags.Static);
}

export function isAbstract(node: ts.Node | undefined): boolean {
    if (!node || !getModifiers(node).length) {
        return false;
    }

    return hasFlag(ts.getCombinedModifierFlags(node as ts.Declaration), ts.ModifierFlags.Abstract);
}

/**
 * This only works if the developer explicitly
 * uses the `override` keyword.
 * To detect if the member overrides a parent
 * member without relying on the `override`
 * keyword, we would need to check if any member
 * in the base class/interface has the same name.
 * This wouldn't be a good idea in terms of performance
 * as there are nodes that can have hundreds
 * of members (for example HTMLElement)
 *
 * @param node
 */
export function isOverride(node: ts.Node | undefined): boolean {
    if (!node || !getModifiers(node).length) {
        return false;
    }

    return hasFlag(ts.getCombinedModifierFlags(node as ts.Declaration), ts.ModifierFlags.Override);
}
