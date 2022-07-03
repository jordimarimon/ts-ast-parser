import { isBareModuleSpecifier, isNotEmptyArray } from '../utils';
import { Import, ImportType } from '../models/import';
import ts from 'typescript';


/**
 * Checks whether the node is an import declaration
 */
export function isImportDeclaration(node: ts.Node | ts.SourceFile): node is ts.ImportDeclaration {
    return node.kind === ts.SyntaxKind.ImportDeclaration;
}

/**
 * Returns true if the import declaration is similar tot the following:
 *
 *      import defaultExport from 'foo';
 */
export function isDefaultImport(node: ts.ImportDeclaration): boolean {
    return !!node?.importClause?.name;
}

/**
 * Returns true if the import declaration is similar tot the following:
 *
 *      import {namedA, namedB} from 'foo';
 */
export function isNamedImport(node: ts.ImportDeclaration): boolean {
    return isNotEmptyArray((node?.importClause?.namedBindings as ts.NamedImports | undefined)?.elements);
}

/**
 * Returns true if the import declaration is similar tot the following:
 *
 *      import * as name from './my-module.js';
 */
export function isNamespaceImport(node: ts.ImportDeclaration): boolean {
    return !!(node?.importClause?.namedBindings as ts.NamespaceImport | undefined)?.name && !isNamedImport(node);
}

/**
 * Extracts the import declaration in the node
 */
export function collectImports(node: ts.Node | ts.SourceFile): Import[] {
    const imports: Import[] = [];

    if (!isImportDeclaration(node)) {
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
