import type { ClassLikeNode, InterfaceOrClassDeclaration, SymbolWithContext } from './is.js';
import { ModifierType } from '../models/member.js';
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
    const symbol = checker.getTypeAtLocation(node).getSymbol();
    const type = symbol && checker.getDeclaredTypeOfSymbol(symbol);
    const props = type?.getProperties() ?? [];

    return createSymbolsWithContext(node, props, checker);
}

export function getStaticMembers(node: ClassLikeNode, checker: ts.TypeChecker): SymbolWithContext[] {
    const symbol = checker.getTypeAtLocation(node).getSymbol();
    const type = symbol && checker.getTypeOfSymbolAtLocation(symbol, node);
    const staticProps = (type && checker.getPropertiesOfType(type)) ?? [];

    return createSymbolsWithContext(node, staticProps, checker);
}

export function createSymbolsWithContext(
    node: InterfaceOrClassDeclaration,
    symbols: ts.Symbol[],
    checker: ts.TypeChecker,
): SymbolWithContext[] {
    const result: SymbolWithContext[] = [];

    for (const propSymbol of symbols) {
        const decl = propSymbol.getDeclarations()?.[0];
        const filePath = decl?.getSourceFile()?.fileName ?? '';
        const propType = checker.getTypeOfSymbolAtLocation(propSymbol, node);

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

        result.push({
            inherited,
            symbol: propSymbol,
            type: propType,
            // This only works if the developer explicitly uses the `override` keyword
            // To detect if the member overrides a parent member without relying on the `override`
            // keyword, we would need to check if any member in the base class/interface has the same name.
            // This wouldn't be a good idea in terms of performance as there are nodes that can have hundreds
            // of members (for example HTMLElement)
            overrides: isOverride(decl),
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

    const parents = baseType.getSymbol()?.getDeclarations()?.slice() || [];
    const constructorDecls = parents.flatMap(parent =>
        ts.isClassDeclaration(parent) ? parent.members.filter(ts.isConstructorDeclaration) : [],
    );
    parents.push(...constructorDecls);

    return parents.some(d => memberSymbolToCheck.getDeclarations()?.some(d2 => d2.parent === d));
}

export function isMember(node: ts.Node | undefined): node is ts.Declaration {
    if (!node) {
        return false;
    }

    return (
        ts.isMethodSignature(node) ||
        ts.isPropertySignature(node) ||
        ts.isPropertyDeclaration(node) ||
        ts.isMethodDeclaration(node)
    );
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
