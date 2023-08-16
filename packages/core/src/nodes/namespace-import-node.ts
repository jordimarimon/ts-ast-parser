import { getOriginalImportPath, isBareModuleSpecifier, matchesTsConfigPath } from '../utils/import.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedRootNode } from '../reflected-node.js';
import type { AnalyserContext } from '../analyser-context.js';
import type { Import } from '../models/import.js';
import { ImportKind } from '../models/import.js';
import { RootNodeType } from '../models/node.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of a namespace import declaration.
 * For example: `import * as foo from './foo.js'`
 */
export class NamespaceImportNode implements ReflectedRootNode<Import, ts.ImportDeclaration> {

    private readonly _node: ts.ImportDeclaration;

    private readonly _context: AnalyserContext;

    constructor(node: ts.ImportDeclaration, context: AnalyserContext) {
        this._node = node;
        this._context = context;
    }

    getTSNode(): ts.ImportDeclaration {
        return this._node;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getName(): string {
        const identifier = (this._node.importClause?.namedBindings as ts.NamespaceImport).name;

        return identifier.escapedText ?? '';
    }

    getNodeType(): RootNodeType {
        return RootNodeType.Import;
    }

    getKind(): ImportKind {
        return ImportKind.Namespace;
    }

    getImportPath(): string {
        return (this._node.moduleSpecifier as ts.StringLiteral).text ?? '';
    }

    getOriginalPath(): string {
        const identifier = (this._node.importClause?.namedBindings as ts.NamespaceImport).name;
        const importPath = this.getImportPath();
        const compilerOptions = this._context.getSystem().getCommandLine().options;

        return matchesTsConfigPath(importPath, compilerOptions)
            ? getOriginalImportPath(identifier, this._context)
            : importPath;
    }

    isTypeOnly(): boolean {
        return !!this._node.importClause?.isTypeOnly;
    }

    isBareModuleSpecifier(): boolean {
        return isBareModuleSpecifier(this.getImportPath());
    }

    /**
     * The reflected node as a serializable object
     */
    serialize(): Import {
        const originalPath = this.getOriginalPath();
        const tmpl: Import = {
            name: this.getName(),
            kind: this.getKind(),
            importPath: this.getImportPath(),
        };

        if (originalPath !== tmpl.importPath) {
            tmpl.originalPath = originalPath;
        }

        tryAddProperty(tmpl, 'typeOnly', this.isTypeOnly());
        tryAddProperty(tmpl, 'bareModuleSpecifier', this.isBareModuleSpecifier());

        return tmpl;
    }
}
