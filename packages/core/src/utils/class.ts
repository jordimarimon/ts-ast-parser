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

export function isReadOnly(member: ts.ClassElement | undefined): boolean {
    if (!member) {
        return false;
    }

    const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];

    return modifiers.some(mod => mod.kind === ts.SyntaxKind.ReadonlyKeyword);
}

export function isStaticMember(member: ts.ClassElement | undefined): boolean {
    if (!member) {
        return false;
    }

    const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];

    return modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
}

export function isAbstract(member: ts.ClassElement | ts.ClassExpression | ts.ClassDeclaration | undefined): boolean {
    if (!member) {
        return false;
    }

    const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];

    return modifiers.some(mod => mod.kind === ts.SyntaxKind.AbstractKeyword);
}

export function isOverride(member: ts.ClassElement | undefined): boolean {
    if (!member) {
        return false;
    }

    const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];

    return modifiers.some(mod => mod.kind === ts.SyntaxKind.OverrideKeyword);
}
