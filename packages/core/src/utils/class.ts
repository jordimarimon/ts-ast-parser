import { ModifierType } from '../models/index.js';
import ts from 'typescript';


export function getVisibilityModifier(member: ts.ClassElement): ModifierType {
    const hasPrivateModifier = member.modifiers?.some(mod => {
        return mod.kind === ts.SyntaxKind.PrivateKeyword;
    });

    if (hasPrivateModifier) {
        return ModifierType.private;
    }

    const hasProtectedModifier = member.modifiers?.some(mod => {
        return mod.kind === ts.SyntaxKind.ProtectedKeyword;
    });

    if (hasProtectedModifier) {
        return ModifierType.protected;
    }

    return ModifierType.public;
}

export function isReadOnly(member: ts.ClassElement): boolean {
    return !!member.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ReadonlyKeyword);
}

export function isStaticMember(member: ts.ClassElement): boolean {
    return !!member?.modifiers?.some?.(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
}
