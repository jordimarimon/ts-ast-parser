import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from './symbol.js';
import { isNotEmptyArray } from './not-empty-array.js';
import type { AnalyzerContext } from '../context.js';
import ts from 'typescript';


export function isBareModuleSpecifier(importPath: string): boolean {
    //
    // Checks whether the imported module only specifies its module in the import path,
    // rather than the full or relative path to where it's located:
    //
    //      import lodash from 'lodash'; --> Correct
    //      import foo from './foo.js'; --> Incorrect
    //
    return !!importPath.replace(/'/g, '')[0]?.match(/[@a-zA-Z\d]/g);
}

export function isThirdParty(path: string): boolean {
    return path.length < 1000 && (/.*node_modules\/.+/.test(path) || /^https?:\/\/.+/.test(path));
}

export function getOriginalImportPath(node: ts.Identifier | undefined, context: AnalyzerContext): string {
    if (!node) {
        return '';
    }

    const symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(node, context.checker), context.checker);
    const decl = symbol?.declarations?.[0];
    const originalFilePath = decl?.getSourceFile().fileName ?? '';

    return context.normalizePath(originalFilePath);
}

export function matchesTsConfigPath(importPath: string, compilerOptions: ts.CompilerOptions): boolean {
    const paths = compilerOptions.paths ?? {};

    for (const pattern in paths) {
        const regExp = new RegExp(pattern);
        const matches = importPath.length < 1000 && regExp.test(importPath);

        if (matches) {
            return true;
        }
    }

    return false;
}

export function isDefaultImport(node: ts.ImportDeclaration): boolean {
    //
    // Case of:
    //      import defaultExport from 'foo';
    //
    return !!node?.importClause?.name;
}

export function isNamedImport(node: ts.ImportDeclaration): boolean {
    //
    // Case of:
    //      import {namedA, namedB} from 'foo';
    //
    const namedImports = node?.importClause?.namedBindings;

    if (!namedImports || !ts.isNamedImports(namedImports)) {
        return false;
    }

    return isNotEmptyArray(namedImports?.elements);
}

export function isNamespaceImport(node: ts.ImportDeclaration): boolean {
    //
    // Case of:
    //      import * as name from './my-module.js';
    //
    const namespaceImports = node?.importClause?.namedBindings;

    if (!namespaceImports || !ts.isNamespaceImport(namespaceImports)) {
        return false;
    }

    return !!namespaceImports?.name && !isNamedImport(node);
}

export function isSideEffectImport(node: ts.ImportDeclaration): boolean {
    //
    // Case of:
    //      import './my-module.js';
    //
    return Object.prototype.hasOwnProperty.call(node, 'importClause') && node.importClause == null;
}
