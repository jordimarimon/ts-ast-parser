import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from './symbol.js';
import { isNotEmptyArray } from './not-empty-array.js';
import type { AnalyserContext } from '../context.js';
import ts from 'typescript';


/**
 * Checks whether the imported module only specifies its module in the import path,
 * rather than the full or relative path to where it's located:
 *
 *      import lodash from 'lodash'; --> Correct
 *      import foo from './foo.js'; --> Incorrect
 *
 * @param importPath - The path to check
 *
 * @returns True of the path represents a bare module specifier
 */
export function isBareModuleSpecifier(importPath: string): boolean {
    return !!importPath.replace(/'/g, '')[0]?.match(/[@a-zA-Z\d]/g);
}

/**
 * Checks whether the import path is from a third party library
 *
 * @param path - The import path
 *
 * @returns True if the path is from a third party library
 */
export function isThirdParty(path: string): boolean {
    return path.length < 1000 && (/.*node_modules\/.+/.test(path) || /^https?:\/\/.+/.test(path));
}

/**
 * Returns the path where the node is defined.
 *
 * @param node - The node to find
 * @param context - The analyzer context where the node belongs to
 *
 * @returns The path where the node is defined
 */
export function getOriginalImportPath(node: ts.Identifier | undefined, context: AnalyserContext): string {
    if (!node) {
        return '';
    }

    const symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(node, context.checker), context.checker);
    const decl = symbol?.declarations?.[0];
    const originalFilePath = decl?.getSourceFile().fileName ?? '';

    return context.system.normalizePath(originalFilePath);
}

/**
 * Checks whether the import path matches a path defined in the `tsconfig.json`.
 *
 * @see https://www.typescriptlang.org/tsconfig#paths
 *
 * @param importPath - The import path
 * @param compilerOptions - The TypeScript compiler options from the analyzer context
 *
 * @returns True if the import has been re-map
 */
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

/**
 * Checks if the import declaration node is a default import.
 *
 * Example:
 *
 *      import defaultExport from 'foo';
 *
 * @param node - The node to check
 *
 * @returns True if the declaration is a default import
 */
export function isDefaultImport(node: ts.ImportDeclaration): boolean {
    return !!node?.importClause?.name;
}

/**
 * Checks if the import declaration node is a named import
 *
 * Example:
 *
 *      import {namedA, namedB} from 'foo';
 *
 * @param node - The node to check
 *
 * @returns True if the declaration is a named import
 */
export function isNamedImport(node: ts.ImportDeclaration): boolean {
    const namedImports = node?.importClause?.namedBindings;

    if (!namedImports || !ts.isNamedImports(namedImports)) {
        return false;
    }

    return isNotEmptyArray(namedImports?.elements);
}

/**
 * Checks if the import declaration node is a namespace import
 *
 * Example:
 *
 *      import * as name from './my-module.js';
 *
 * @param node - The node to check
 *
 * @returns True if the declaration is a namespace import
 */
export function isNamespaceImport(node: ts.ImportDeclaration): boolean {
    const namespaceImports = node?.importClause?.namedBindings;

    if (!namespaceImports || !ts.isNamespaceImport(namespaceImports)) {
        return false;
    }

    return !!namespaceImports?.name && !isNamedImport(node);
}

/**
 * Checks whether the import declaration has side effects
 *
 * Example:
 *
 *      import './my-module.js';
 *
 * @param node - The node to check
 *
 * @returns True if the import has side effects
 */
export function isSideEffectImport(node: ts.ImportDeclaration): boolean {
    return Object.prototype.hasOwnProperty.call(node, 'importClause') && node.importClause == null;
}
