import { getOriginalImportPath, matchesTsConfigPath, isBareModuleSpecifier } from '../utils/import.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { Import, ImportKind } from '../models/import.js';
import { ImportNode } from './import-node.js';
import ts from 'typescript';


export class NamespaceImportNode implements ImportNode {

    private readonly _node: ts.ImportDeclaration;

    constructor(node: ts.ImportDeclaration) {
        this._node = node;
    }

    getTSNode(): ts.ImportDeclaration {
        return this._node;
    }

    getName(): string {
        const identifier = (this._node.importClause?.namedBindings as ts.NamespaceImport)?.name;

        return identifier?.escapedText ?? '';
    }

    getKind(): ImportKind {
        return ImportKind.namespace;
    }

    getImportPath(): string {
        return (this._node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
    }

    getOriginalPath(): string {
        const identifier = (this._node.importClause?.namedBindings as ts.NamespaceImport)?.name;
        const importPath = this.getImportPath();

        return matchesTsConfigPath(importPath) ? getOriginalImportPath(identifier) : importPath;
    }

    isTypeOnly(): boolean {
        return !!this._node?.importClause?.isTypeOnly;
    }

    isBareModuleSpecifier(): boolean {
        return isBareModuleSpecifier(this.getImportPath());
    }

    toPOJO(): Import {
        const originalPath = this.getOriginalPath();
        const tmpl: Import = {
            name: this.getName(),
            kind: this.getKind(),
            importPath: this.getImportPath(),
        };

        if (originalPath !== tmpl.importPath) {
            tmpl.originalPath = originalPath;
        }

        tryAddProperty(tmpl, 'isTypeOnly', this.isTypeOnly());
        tryAddProperty(tmpl, 'isBareModuleSpecifier', this.isBareModuleSpecifier());

        return tmpl;
    }

}
