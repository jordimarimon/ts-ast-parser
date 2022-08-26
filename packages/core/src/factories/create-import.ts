import { isBareModuleSpecifier, isDefaultImport, isNamedImport, isNamespaceImport } from '../utils/index.js';
import { Import, ImportType, Module } from '../models/index.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';


export const importFactory: NodeFactory<ts.ImportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ImportDeclaration => ts.isImportDeclaration(node),

    create: createImport,

};

function createImport(node: ts.ImportDeclaration, moduleDoc: Module): void {
    const imports: Import[] = [];

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

    moduleDoc.imports = imports;
}
