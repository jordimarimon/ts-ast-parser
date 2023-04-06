import { ModifierType } from '../models/class.js';
import ts from 'typescript';


export function getVisibilityModifier(member: ts.ClassElement): ModifierType {
    const modifierFlags = ts.getCombinedModifierFlags(member);
    const hasPrivateModifier = hasFlag(modifierFlags, ts.ModifierFlags.Private);

    if (hasPrivateModifier || (member.name && ts.isPrivateIdentifier(member.name))) {
        return ModifierType.private;
    }

    const hasProtectedModifier = hasFlag(modifierFlags, ts.ModifierFlags.Protected);

    if (hasProtectedModifier) {
        return ModifierType.protected;
    }

    return ModifierType.public;
}

export function isReadOnly(member: ts.Declaration | undefined): boolean {
    return !!member && hasFlag(ts.getCombinedModifierFlags(member), ts.ModifierFlags.Readonly);
}

export function isOverride(member: ts.Declaration | undefined): boolean {
    return !!member && hasFlag(ts.getCombinedModifierFlags(member), ts.ModifierFlags.Override);
}

export function isOptional(symbol: ts.Symbol | undefined): boolean {
    return !!symbol && hasFlag(symbol.flags, ts.SymbolFlags.Optional);
}

export function isStaticMember(member: ts.Declaration | undefined): boolean {
    return !!member && hasFlag(ts.getCombinedModifierFlags(member), ts.ModifierFlags.Static);
}

export function isAbstract(member: ts.Declaration | undefined): boolean {
    return !!member && hasFlag(ts.getCombinedModifierFlags(member), ts.ModifierFlags.Abstract);
}

function hasFlag(flags: number, flagToCheck: number): boolean {
    return (flags & flagToCheck) === flagToCheck;
}
