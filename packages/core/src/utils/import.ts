import { isNotEmptyArray } from './not-empty-array.js';
import ts from 'typescript';


export function isBareModuleSpecifier(specifier: string): boolean {
    //
    // Checks whether the imported module only specifies its module in the import path,
    // rather than the full or relative path to where it's located:
    //
    //      import lodash from 'lodash'; --> Correct
    //      import foo from './foo.js'; --> Incorrect
    //
    return !!specifier?.replace(/'/g, '')[0].match(/[@a-zA-Z\d]/g);
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
