import { Import, ImportType, Module } from '../models/index.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';
import {
    isBareModuleSpecifier,
    isDefaultImport,
    isNamedImport,
    isNamespaceImport,
    tryAddProperty,
} from '../utils/index.js';


export const importFactory: NodeFactory<ts.ImportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ImportDeclaration => ts.isImportDeclaration(node),

    create: createImport,

};

function createImport(node: ts.ImportDeclaration, moduleDoc: Module): void {
    const imports: Import[] = [];

    if (isDefaultImport(node)) {
        const modSpecifier = (node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
        const tmpl: Import = {
            name: node.importClause?.name?.escapedText ?? '',
            kind: ImportType.default,
            importPath: modSpecifier,
        };

        tryAddProperty(tmpl, 'isTypeOnly', !!node?.importClause?.isTypeOnly);
        tryAddProperty(tmpl, 'isBareModuleSpecifier', isBareModuleSpecifier(modSpecifier));

        imports.push(tmpl);
    }

    if (isNamedImport(node)) {
        const elements = (node.importClause?.namedBindings as ts.NamedImports).elements ?? [];

        for (const element of elements) {
            const modSpecifier = (node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
            const tmpl: Import = {
                name: element.name.escapedText ?? '',
                kind: ImportType.named,
                importPath: modSpecifier,
            };

            tryAddProperty(tmpl, 'isTypeOnly', !!node?.importClause?.isTypeOnly);
            tryAddProperty(tmpl, 'isBareModuleSpecifier', isBareModuleSpecifier(modSpecifier));

            imports.push(tmpl);
        }
    }

    if (isNamespaceImport(node)) {
        const modSpecifier = (node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
        const tmpl: Import = {
            name: (node.importClause?.namedBindings as ts.NamespaceImport).name.escapedText ?? '',
            kind: ImportType.namespace,
            importPath: modSpecifier,
        };

        tryAddProperty(tmpl, 'isTypeOnly', !!node?.importClause?.isTypeOnly);
        tryAddProperty(tmpl, 'isBareModuleSpecifier', isBareModuleSpecifier(modSpecifier));

        imports.push(tmpl);
    }

    moduleDoc.imports = imports;
}
