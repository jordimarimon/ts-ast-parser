import { getOriginalImportPath, isBareModuleSpecifier, matchesTsConfigPath } from '../utils/import.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import { Import, ImportKind } from '../models/import.js';
import { ImportNode } from './import-node.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


export class NamedImportNode implements ImportNode {

    private readonly _node: ts.ImportDeclaration;

    private readonly _element: ts.ImportSpecifier;

    constructor(node: ts.ImportDeclaration, element: ts.ImportSpecifier) {
        this._node = node;
        this._element = element;
    }

    getTSNode(): ts.ImportDeclaration {
        return this._node;
    }

    getName(): string {
        return this._element.name.escapedText ?? '';
    }

    getReferenceName(): string {
        return this._element.propertyName?.escapedText ?? this.getName();
    }

    getType(): NodeType {
        return NodeType.Import;
    }

    getKind(): ImportKind {
        return ImportKind.named;
    }

    getImportPath(): string {
        return (this._node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
    }

    getOriginalPath(): string {
        const importPath = this.getImportPath();

        return matchesTsConfigPath(importPath) ? getOriginalImportPath(this._element.name) : importPath;
    }

    isTypeOnly(): boolean {
        return !!this._node?.importClause?.isTypeOnly;
    }

    isBareModuleSpecifier(): boolean {
        return isBareModuleSpecifier(this.getImportPath());
    }

    toPOJO(): Import {
        const originalPath = this.getOriginalPath();
        const referenceName = this.getReferenceName();
        const tmpl: Import = {
            name: this.getName(),
            kind: this.getKind(),
            importPath: this.getImportPath(),
        };

        if (referenceName !== tmpl.name) {
            tmpl.referenceName = referenceName;
        }

        if (originalPath !== tmpl.importPath) {
            tmpl.originalPath = originalPath;
        }

        tryAddProperty(tmpl, 'isTypeOnly', this.isTypeOnly());
        tryAddProperty(tmpl, 'isBareModuleSpecifier', this.isBareModuleSpecifier());

        return tmpl;
    }

}
