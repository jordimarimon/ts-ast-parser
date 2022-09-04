import { Import, ImportType, Module } from '../models/index.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';
import {
    getOriginalImportPath,
    isBareModuleSpecifier,
    isDefaultImport,
    isNamedImport,
    isNamespaceImport,
    matchesTsConfigPath,
    tryAddProperty,
} from '../utils/index.js';


export const importFactory: NodeFactory<ts.ImportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ImportDeclaration => ts.isImportDeclaration(node),

    create: createImport,

};

function createImport(node: ts.ImportDeclaration, moduleDoc: Module): void {
    let imports: Import[] = [];

    if (isDefaultImport(node)) {
        imports.push(createDefaultImport(node));
    }

    if (isNamedImport(node)) {
        imports = imports.concat(createNamedImport(node));
    }

    if (isNamespaceImport(node)) {
        imports.push(createNamespaceImport(node));
    }

    moduleDoc.imports = imports;
}

function createDefaultImport(node: ts.ImportDeclaration): Import {
    const modSpecifier = (node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
    const identifier = node.importClause?.name;
    const originalPath = getOriginalImportPath(identifier);
    const tmpl: Import = {
        name: identifier?.escapedText ?? '',
        kind: ImportType.default,
        importPath: modSpecifier,
    };

    if (matchesTsConfigPath(modSpecifier)) {
        tmpl.originalPath = originalPath;
    }

    tryAddProperty(tmpl, 'isTypeOnly', !!node?.importClause?.isTypeOnly);
    tryAddProperty(tmpl, 'isBareModuleSpecifier', isBareModuleSpecifier(modSpecifier));

    return tmpl;
}

function createNamedImport(node: ts.ImportDeclaration): Import[] {
    const elements = (node.importClause?.namedBindings as ts.NamedImports).elements ?? [];
    const modSpecifier = (node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
    const result: Import[] = [];

    for (const element of elements) {
        const name = element.name.escapedText ?? '';
        const originalPath = getOriginalImportPath(element.name);
        const tmpl: Import = {
            name,
            kind: ImportType.named,
            importPath: modSpecifier,
        };

        if (matchesTsConfigPath(modSpecifier)) {
            tmpl.originalPath = originalPath;
        }

        tryAddProperty(tmpl, 'isTypeOnly', !!node?.importClause?.isTypeOnly);
        tryAddProperty(tmpl, 'isBareModuleSpecifier', isBareModuleSpecifier(modSpecifier));

        result.push(tmpl);
    }

    return result;
}

function createNamespaceImport(node: ts.ImportDeclaration): Import {
    const modSpecifier = (node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
    const identifier = (node.importClause?.namedBindings as ts.NamespaceImport).name;
    const originalPath = getOriginalImportPath(identifier);
    const tmpl: Import = {
        name: identifier.escapedText ?? '',
        kind: ImportType.namespace,
        importPath: modSpecifier,
    };

    if (matchesTsConfigPath(modSpecifier)) {
        tmpl.originalPath = originalPath;
    }

    tryAddProperty(tmpl, 'isTypeOnly', !!node?.importClause?.isTypeOnly);
    tryAddProperty(tmpl, 'isBareModuleSpecifier', isBareModuleSpecifier(modSpecifier));

    return tmpl;
}
