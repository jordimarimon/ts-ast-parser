import { getOriginalImportPath, isBareModuleSpecifier, matchesTsConfigPath } from '../utils/import.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedRootNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import type { Import } from '../models/import.js';
import { ImportKind } from '../models/import.js';
import { RootNodeType } from '../models/node.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of a default import declaration.
 *
 * For example `import x from 'y'`.
 */
export class DefaultImportNode implements ReflectedRootNode<Import, ts.ImportDeclaration> {

    private readonly _node: ts.ImportDeclaration;

    private readonly _context: ProjectContext;

    constructor(node: ts.ImportDeclaration, context: ProjectContext) {
        this._node = node;
        this._context = context;
    }

    /**
     * The name of symbol that is imported
     *
     * @returns The name of symbol that is imported
     */
    getName(): string {
        return this._node.importClause?.name?.escapedText ?? '';
    }

    /**
     * The original TypeScript node
     *
     * @returns The TypeScript AST node related to this relfected node
     */
    getTSNode(): ts.ImportDeclaration {
        return this._node;
    }

    /**
     * The context includes useful APIs that are shared across
     * all the reflected symbols.
     *
     * Some APIs include the parsed configuration options, the
     * system interface, the type checker
     *
     * @returns The analyser context
     */
    getContext(): ProjectContext {
        return this._context;
    }

    /**
     * The reflected node kind
     *
     * @returns The import declaration kind
     */
    getNodeType(): RootNodeType {
        return RootNodeType.Import;
    }

    /**
     * The reflected import kind
     *
     * @returns The default import kind
     */
    getKind(): ImportKind {
        return ImportKind.Default;
    }

    /**
     * An import may be an alias to another symbol.
     * For default imports it won't happen.
     * This method as of right now is an alias to `getName()`.
     *
     * @returns The referenced symbol name
     */
    getReferenceName(): string {
        return this.getName();
    }

    /**
     * The path used in the import declaration
     *
     * @returns The path specified in the import declaration. This may not be the
     * real path if you're using an alias
     */
    getImportPath(): string {
        return (this._node.moduleSpecifier as ts.StringLiteral).text ?? '';
    }

    /**
     * If the path matches a TSConfig file path, this will be the original
     * source path from where the symbol is being imported
     *
     * @returns The real path where the symbol is located
     */
    getOriginalPath(): string {
        const identifier = this._node.importClause?.name;
        const importPath = this.getImportPath();
        const compilerOptions = this._context.getCommandLine().options;

        return matchesTsConfigPath(importPath, compilerOptions)
            ? getOriginalImportPath(identifier, this._context)
            : importPath;
    }

    /**
     * Whether it's a type only import.
     * For example: `import type x from 'y'`
     *
     * @returns True if the imported symbol uses the `type` keyword
     */
    isTypeOnly(): boolean {
        return !!this._node.importClause?.isTypeOnly;
    }

    /**
     * Bare module specifiers let you import modules without specifying
     * the absolute/relative path where the module is located.
     *
     * For example: `import lodash from 'lodash'`
     *
     * @returns True if the import specifier is a bare module specifier, otherwise false
     */
    isBareModuleSpecifier(): boolean {
        return isBareModuleSpecifier(this.getImportPath());
    }

    /**
     * Serializes the reflected node
     *
     * @returns The reflected node as a serializable object
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
