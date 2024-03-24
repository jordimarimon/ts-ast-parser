import type { ProjectContext } from '../project-context.js';
import { isThirdParty } from '../utils/import.js';
import { hasFlag } from '../utils/has-flag.js';
import ts from 'typescript';


type InterfaceOrClassDeclaration = ts.ClassDeclaration |
    ts.ClassExpression |
    ts.InterfaceDeclaration;

export interface SymbolWithContext {
    symbol: ts.Symbol | undefined | null;
    type: ts.Type | undefined | null;
    inherited?: boolean;
}

export abstract class ClassOrInterfaceNode {

    protected _getInstanceMembers(
        node: InterfaceOrClassDeclaration,
        context: ProjectContext,
    ): SymbolWithContext[] {
        const checker = context.getTypeChecker();
        const symbol = checker.getTypeAtLocation(node).getSymbol();
        const type = symbol && checker.getDeclaredTypeOfSymbol(symbol);
        const props = type?.getProperties() ?? [];

        return this._createSymbolsWithContext(node, props, context);
    }

    protected _getStaticMembers(
        node: InterfaceOrClassDeclaration,
        context: ProjectContext,
    ): SymbolWithContext[] {
        const checker = context.getTypeChecker();
        const symbol = checker.getTypeAtLocation(node).getSymbol();
        const type = symbol && checker.getTypeOfSymbolAtLocation(symbol, node);
        const staticProps = (type && checker.getPropertiesOfType(type)) ?? [];

        return this._createSymbolsWithContext(node, staticProps, context);
    }

    private _createSymbolsWithContext(
        node: InterfaceOrClassDeclaration,
        symbols: ts.Symbol[],
        context: ProjectContext,
    ): SymbolWithContext[] {
        const result: SymbolWithContext[] = [];
        const checker = context.getTypeChecker();
        const system = context.getSystem();

        for (const symbol of symbols) {
            const decl = symbol.getDeclarations()?.[0];
            const fileName = decl?.getSourceFile()?.fileName ?? '';
            const filePath = fileName ? system.realpath(fileName) : '';
            const type = checker.getTypeOfSymbolAtLocation(symbol, node);

            // Don't convert namespace members, or the prototype here
            if (
                hasFlag(symbol.flags, ts.SymbolFlags.ModuleMember) ||
                hasFlag(symbol.flags, ts.SymbolFlags.Prototype)
            ) {
                continue;
            }

            // Ignore properties that come from third party libraries
            if (isThirdParty(filePath)) {
                continue;
            }

            const inherited = this._isInherited(node, symbol, checker);

            result.push({inherited, symbol, type});
        }

        return result;
    }

    private _isInherited(
        interfaceOrClassNode: InterfaceOrClassDeclaration,
        memberSymbolToCheck: ts.Symbol,
        checker: ts.TypeChecker,
    ): boolean {
        const type = checker.getTypeAtLocation(interfaceOrClassNode);
        const baseType = type.getBaseTypes()?.[0];

        if (!baseType) {
            return false;
        }

        const parents = baseType.getSymbol()?.getDeclarations()?.slice() ?? [];
        const constructorDecls = parents.flatMap(parent => {
            return ts.isClassDeclaration(parent)
                ? parent.members.filter(ts.isConstructorDeclaration)
                : [];
        });
        parents.push(...constructorDecls);

        return parents.some(d => {
            return memberSymbolToCheck.getDeclarations()?.some(d2 => {
                return d2.parent === d;
            });
        });
    }
}
