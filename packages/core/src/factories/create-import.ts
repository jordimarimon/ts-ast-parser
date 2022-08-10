import { Import, ImportType } from '../models/index.js';
import { isNotEmptyArray } from '../utils/index.js';
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

export function createImport(node: ts.Node | ts.SourceFile): Import[] {
    const imports: Import[] = [];

    if (!ts.isImportDeclaration(node)) {
        return imports;
    }

    if (isDefaultImport(node)) {
        imports.push({
            name: node.importClause?.name?.escapedText ?? '',
            kind: ImportType.default,
            importPath: (node.moduleSpecifier as ts.StringLiteral)?.text,
            isBareModuleSpecifier: isBareModuleSpecifier((node.moduleSpecifier as ts.StringLiteral)?.text),
            isTypeOnly: !!node?.importClause?.isTypeOnly,
        });
    }

    if (isNamedImport(node)) {
        (node.importClause?.namedBindings as ts.NamedImports).elements.forEach((element) => {
            const importTemplate = {
                name: element.name.escapedText ?? '',
                kind: ImportType.named,
                importPath: (node.moduleSpecifier as ts.StringLiteral)?.text ?? '',
                isBareModuleSpecifier: isBareModuleSpecifier((node.moduleSpecifier as ts.StringLiteral)?.text),
                isTypeOnly: !!node?.importClause?.isTypeOnly,
            };

            imports.push(importTemplate);
        });
    }

    if (isNamespaceImport(node)) {
        imports.push({
            name: (node.importClause?.namedBindings as ts.NamespaceImport).name.escapedText ?? '',
            kind: ImportType.namespace,
            importPath: (node.moduleSpecifier as ts.StringLiteral)?.text ?? '',
            isBareModuleSpecifier: isBareModuleSpecifier((node.moduleSpecifier as ts.StringLiteral)?.text),
            isTypeOnly: !!node?.importClause?.isTypeOnly,
        });
    }

    return imports;
}
