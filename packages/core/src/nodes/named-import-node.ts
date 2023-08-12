import { getOriginalImportPath, isBareModuleSpecifier, matchesTsConfigPath } from '../utils/import.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedRootNode } from './reflected-node.js';
import type { AnalyserContext } from '../context.js';
import type { Import } from '../models/import.js';
import { ImportKind } from '../models/import.js';
import { RootNodeType } from '../models/node.js';
import type ts from 'typescript';


export class NamedImportNode implements ReflectedRootNode<Import, ts.ImportDeclaration> {

    private readonly _node: ts.ImportDeclaration;

    private readonly _element: ts.ImportSpecifier;

    private readonly _context: AnalyserContext;

    constructor(node: ts.ImportDeclaration, element: ts.ImportSpecifier, context: AnalyserContext) {
        this._node = node;
        this._element = element;
        this._context = context;
    }

    getTSNode(): ts.ImportDeclaration {
        return this._node;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getName(): string {
        return this._element.name.escapedText ?? '';
    }

    getReferenceName(): string {
        return this._element.propertyName?.escapedText ?? this.getName();
    }

    getNodeType(): RootNodeType {
        return RootNodeType.Import;
    }

    getKind(): ImportKind {
        return ImportKind.Named;
    }

    getImportPath(): string {
        return (this._node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
    }

    getOriginalPath(): string {
        const importPath = this.getImportPath();

        return matchesTsConfigPath(importPath, this._context.system.getCommandLine().options)
            ? getOriginalImportPath(this._element.name, this._context)
            : importPath;
    }

    isTypeOnly(): boolean {
        return !!this._node.importClause?.isTypeOnly;
    }

    isBareModuleSpecifier(): boolean {
        return isBareModuleSpecifier(this.getImportPath());
    }

    serialize(): Import {
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

        tryAddProperty(tmpl, 'typeOnly', this.isTypeOnly());
        tryAddProperty(tmpl, 'bareModuleSpecifier', this.isBareModuleSpecifier());

        return tmpl;
    }

}
