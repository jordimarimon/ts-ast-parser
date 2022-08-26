import ts from 'typescript';


export function hasNonPublicModifier(member: ts.ClassElement): boolean {
    return !!member.modifiers?.some(mod => {
        return mod.kind === ts.SyntaxKind.PrivateKeyword || mod.kind === ts.SyntaxKind.ProtectedKeyword;
    });
}

export function isReadOnly(member: ts.ClassElement): boolean {
    return !!member.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ReadonlyKeyword);
}

export function isStaticMember(member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean {
    return !!member?.modifiers?.some?.(x => x.kind === ts.SyntaxKind.StaticKeyword);
}
