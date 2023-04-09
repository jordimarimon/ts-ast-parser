import { ClassLikeNode, InterfaceOrClassDeclaration, SymbolWithContext, SymbolWithDeclaration } from './is.js';
import { ModifierType } from '../models/member.js';
import { getSymbolAtLocation } from './symbol.js';
import { isThirdParty } from './import.js';
import ts from 'typescript';


export function getVisibilityModifier(member: ts.ClassElement): ModifierType {
    const modifierFlags = ts.getCombinedModifierFlags(member);

    if (hasFlag(modifierFlags, ts.ModifierFlags.Private) || (member.name && ts.isPrivateIdentifier(member.name))) {
        return ModifierType.private;
    }

    if (hasFlag(modifierFlags, ts.ModifierFlags.Protected)) {
        return ModifierType.protected;
    }

    return ModifierType.public;
}

export function getInstanceMembers(node: InterfaceOrClassDeclaration, checker: ts.TypeChecker): SymbolWithContext[] {
    const type = checker.getTypeAtLocation(node);
    const props = type?.getProperties() ?? [];

    return createSymbolsWithContext(node, props, checker);
}

export function getStaticMembers(node: ClassLikeNode, checker: ts.TypeChecker): SymbolWithContext[] {
    const symbol = checker.getTypeAtLocation(node).getSymbol();
    const type = symbol && checker.getTypeOfSymbolAtLocation(symbol, node);
    const staticProps = (type && checker.getPropertiesOfType(type)) ?? [];

    return createSymbolsWithContext(node, staticProps, checker);
}

export function getIndexSignature(
    node: ts.InterfaceDeclaration,
    checker: ts.TypeChecker,
): SymbolWithDeclaration<ts.IndexSignatureDeclaration> | null {
    const indexSymbol = getSymbolAtLocation(node, checker)?.members?.get('__index' as ts.__String);
    const decl = indexSymbol?.getDeclarations()?.[0];

    if (!decl || !ts.isIndexSignatureDeclaration(decl)) {
        const baseType = checker.getTypeAtLocation(node).getBaseTypes()?.[0];
        const baseNode = baseType?.getSymbol()?.getDeclarations()?.[0];

        return baseNode && ts.isInterfaceDeclaration(baseNode)
            ? getIndexSignature(baseNode, checker)
            : null;
    }

    return {
        symbol: indexSymbol,
        declaration: decl,
    };
}

export function createSymbolsWithContext(
    node: InterfaceOrClassDeclaration,
    symbols: ts.Symbol[],
    checker: ts.TypeChecker,
): SymbolWithContext[] {
    const result: SymbolWithContext[] = [];
    const members = node.members.map(m => getSymbolAtLocation(m, checker)?.getName() ?? '');

    for (const propSymbol of symbols) {
        const decl = propSymbol.getDeclarations()?.[0];
        const filePath = decl?.getSourceFile()?.fileName ?? '';
        const propType = checker.getTypeOfSymbolAtLocation(propSymbol, node);

        if (!decl) {
            continue;
        }

        // Don't convert namespace members, or the prototype here
        if (
            hasFlag(propSymbol.flags, ts.SymbolFlags.ModuleMember) ||
            hasFlag(propSymbol.flags, ts.SymbolFlags.Prototype)
        ) {
            continue;
        }

        // Ignore properties that come from third party libraries
        if (isThirdParty(filePath)) {
            continue;
        }

        const inherited = isInherited(node, propSymbol, checker);
        const isDeclFromThisNode = members.some(memberName => memberName === propSymbol.getName());

        result.push({
            inherited,
            symbol: propSymbol,
            type: propType,
            overrides: isOverride(decl) || (inherited && isDeclFromThisNode),
        });
    }

    return result;
}

export function isInherited(
    interfaceOrClassNode: InterfaceOrClassDeclaration,
    memberSymbolToCheck: ts.Symbol,
    checker: ts.TypeChecker,
): boolean {
    const type = checker.getTypeAtLocation(interfaceOrClassNode);
    const baseType = type?.getBaseTypes()?.[0];

    if (!baseType) {
        return false;
    }

    // FIXME(Jordi M.): Here we may have a performance bottleneck as there could be
    //  a lot of parent members to check.
    return baseType.getProperties().some(parentMemberSymbol => {
        return parentMemberSymbol.getName() === memberSymbolToCheck.getName();
    });
}

export function isMember(node: ts.Node | undefined): node is ts.Declaration {
    if (!node) {
        return false;
    }

    return ts.isMethodSignature(node) || ts.isPropertySignature(node) ||
        ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node);
}

export function isReadOnly(node: ts.Node | undefined): boolean {
    if (!node || !ts.canHaveModifiers(node) || ts.isVariableStatement(node) || ts.isImportDeclaration(node)) {
        return false;
    }

    return hasFlag(ts.getCombinedModifierFlags(node), ts.ModifierFlags.Readonly);
}

export function isOverride(node: ts.Node | undefined): boolean {
    if (!node || !ts.canHaveModifiers(node) || ts.isVariableStatement(node) || ts.isImportDeclaration(node)) {
        return false;
    }

    return hasFlag(ts.getCombinedModifierFlags(node), ts.ModifierFlags.Override);
}

export function isOptional(symbol: ts.Symbol | undefined): boolean {
    return !!symbol && hasFlag(symbol.flags, ts.SymbolFlags.Optional);
}

export function isStatic(node: ts.Node | undefined): boolean {
    if (!node || !ts.canHaveModifiers(node) || ts.isVariableStatement(node) || ts.isImportDeclaration(node)) {
        return false;
    }

    return hasFlag(ts.getCombinedModifierFlags(node), ts.ModifierFlags.Static);
}

export function isAbstract(node: ts.Node | undefined): boolean {
    if (!node || !ts.canHaveModifiers(node) || ts.isVariableStatement(node) || ts.isImportDeclaration(node)) {
        return false;
    }

    return hasFlag(ts.getCombinedModifierFlags(node), ts.ModifierFlags.Abstract);
}

export function hasFlag(flags: number, flagToCheck: number): boolean {
    return (flags & flagToCheck) === flagToCheck;
}
