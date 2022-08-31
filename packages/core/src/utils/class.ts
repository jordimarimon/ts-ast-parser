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

export function isReadOnly(member: ts.ClassElement | undefined): boolean {
    return !!member?.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ReadonlyKeyword);
}

export function isStaticMember(member: ts.ClassElement | undefined): boolean {
    return !!member?.modifiers?.some?.(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
}

export function isAbstract(node: ts.ClassElement | ts.ClassExpression | ts.ClassDeclaration | undefined): boolean {
    return !!node?.modifiers?.some?.(mod => mod.kind === ts.SyntaxKind.AbstractKeyword);
}

export function isOverride(node: ts.ClassElement | undefined): boolean {
    return !!node?.modifiers?.some?.(mod => mod.kind === ts.SyntaxKind.OverrideKeyword);
}
