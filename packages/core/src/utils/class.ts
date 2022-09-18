import { ModifierType } from '../models/index.js';
import ts from 'typescript';


export function getVisibilityModifier(member: ts.ClassElement): ModifierType {
    const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];
    const hasPrivateModifier = modifiers.some(mod => {
        return mod.kind === ts.SyntaxKind.PrivateKeyword;
    });

    if (hasPrivateModifier) {
        return ModifierType.private;
    }

    const hasProtectedModifier = modifiers.some(mod => {
        return mod.kind === ts.SyntaxKind.ProtectedKeyword;
    });

    if (hasProtectedModifier) {
        return ModifierType.protected;
    }

    return ModifierType.public;
}

export function isReadOnly(symbol: ts.Symbol | undefined, member: ts.Declaration | undefined): boolean {
    if (!member || !symbol) {
        return false;
    }

    const modifiers = ts.getCombinedModifierFlags(member);

    return (modifiers & ts.ModifierFlags.Readonly) === ts.ModifierFlags.Readonly;
}

export function isOverride(symbol: ts.Symbol | undefined, member: ts.Declaration | undefined): boolean {
    if (!member || !symbol) {
        return false;
    }

    const modifiers = ts.getCombinedModifierFlags(member);

    return (modifiers & ts.ModifierFlags.Override) === ts.ModifierFlags.Override;
}

export function isOptional(symbol: ts.Symbol | undefined): boolean {
    return !!symbol && (symbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional;
}

export function isStaticMember(member: ts.Declaration | undefined): boolean {
    if (!member) {
        return false;
    }

    const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];

    return modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
}

export function isAbstract(member: ts.Declaration | undefined): boolean {
    if (!member) {
        return false;
    }

    const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];

    return modifiers.some(mod => mod.kind === ts.SyntaxKind.AbstractKeyword);
}
