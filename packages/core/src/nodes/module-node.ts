import { importFactory, declarationFactories, exportFactories } from '../factories/index.js';
import type { ReflectedNode, ReflectedRootNode } from '../reflected-node.js';
import type { DeclarationKind } from '../models/declaration-kind.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ExportNode, ImportNode } from '../utils/is.js';
import type { DeclarationNode } from './declaration-node.js';
import type { ProjectContext } from '../project-context.js';
import type { Module } from '../models/module.js';
import { CommentNode } from './comment-node.js';
import { is } from '../utils/is.js';
import ts from 'typescript';


/**
 * Represents a reflected module as a collection of imports, exports and
 * class/interface/function/type-alias/enum declarations
 */
export class ModuleNode implements ReflectedNode<Module, ts.SourceFile> {

    private _declarations: DeclarationNode[] = [];

    private readonly _exports: ExportNode[] = [];

    private readonly _imports: ImportNode[] = [];

    private readonly _node: ts.SourceFile;

    private readonly _context: ProjectContext;

    private readonly _jsDoc: CommentNode;

    constructor(node: ts.SourceFile, context: ProjectContext) {
        this._node = node;
        this._context = context;
        this._jsDoc = new CommentNode(this._node);

        this._visitNode(node);
        this._removeNonPublicDeclarations();
    }

    /**
     * The original TypeScript node
     *
     * @returns The TypeScript AST node associated with this module
     */
    getTSNode(): ts.SourceFile {
        return this._node;
    }

    /**
     * The path to the source file for this module relative to the current
     * working directory
     *
     * @returns The relative path where the module is located
     */
    getSourcePath(): string {
        return this._context.getSystem().normalizePath(this._node.fileName);
    }

    /**
     * The path where the JS file will be output by the TypeScript Compiler
     *
     * @returns The relative path where the TypeScript compiler would emit the JS module. If
     * the source file is a JS file, it returns the source path.
     */
    getOutputPath(): string {
        const sourcePath = this._node.fileName;
        const system = this._context.getSystem();

        // If the source file was already JS, just return that
        if (sourcePath.endsWith('js')) {
            return system.normalizePath(sourcePath);
        }

        // Use the TS API to determine where the associated JS will be output based
        // on tsconfig settings.
        const absolutePath = system.getAbsolutePath(sourcePath);
        const outputPath = ts.getOutputFileNames(this._context.getCommandLine(), absolutePath, false)[0];

        return system.normalizePath(outputPath ?? '');
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
     * All the import declarations found in the source file
     *
     * @returns The reflected import declarations
     */
    getImports(): ImportNode[] {
        return this._imports;
    }

    /**
     * All the export declarations found in the source file
     *
     * @returns The reflected export declarations
     */
    getExports(): ExportNode[] {
        return this._exports;
    }

    /**
     * All the class/interface/function/type-alias/enum declarations found
     * in the source file
     *
     * @returns The reflected declaration nodes
     */
    getDeclarations(): DeclarationNode[] {
        return this._declarations;
    }

    /**
     * Reflects the module-level JSDoc comment
     *
     * @returns The module-level JSDoc comment blocks for a given source file.
     */
    getJSDoc(): CommentNode {
        return this._jsDoc;
    }

    /**
     * Finds a declaration based on it's kind
     *
     * @param kind - The declaration kind
     * @returns All declaration nodes found
     */
    getDeclarationByKind(kind: DeclarationKind): DeclarationNode[] {
        return this.getDeclarations().filter(decl => decl.getKind() === kind);
    }

    /**
     * Finds a declaration based on it's name
     *
     * @param name - The declaration name
     * @returns The matched declaration found if any
     */
    getDeclarationByName(name: string): DeclarationNode | null {
        return this.getDeclarations().find(decl => decl.getName() === name) ?? null;
    }

    /**
     * Returns all the declarations that have the tag `@category`
     * with the specified name
     *
     * @param category - The category name
     * @returns All declaration nodes found
     */
    getDeclarationsByCategory(category: string): DeclarationNode[] {
        return this.getDeclarations().filter(decl => {
            return decl.getJSDoc()?.getTag('category')?.text === category;
        });
    }

    /**
     * Serializes the reflected node
     *
     * @returns The reflected node as a serializable object
     */
    serialize(): Module {
        const result: Module = {
            sourcePath: this.getSourcePath(),
            outputPath: this.getOutputPath(),
            imports: this.getImports().map(imp => imp.serialize()),
            declarations: this.getDeclarations().map(dec => dec.serialize()),
            exports: this.getExports().map(exp => exp.serialize()),
        };

        tryAddProperty(result, 'jsDoc', this.getJSDoc().serialize());

        return result;
    }

    private _visitNode(rootNode: ts.Node | ts.SourceFile): void {
        let declarationFound = false;

        if (importFactory.isNode(rootNode)) {
            this._add(importFactory.create(rootNode, this._context));
        }

        for (const factory of declarationFactories) {
            if (factory.isNode(rootNode)) {
                this._add(factory.create(rootNode, this._context));
                declarationFound = true;
            }
        }

        for (const factory of exportFactories) {
            if (factory.isNode(rootNode)) {
                this._add(factory.create(rootNode, this._context));
            }
        }

        if (!declarationFound) {
            ts.forEachChild(rootNode, node => this._visitNode(node));
        }
    }

    private _add(reflectedNodes: ReflectedRootNode[]): void {
        for (const reflectedNode of reflectedNodes) {
            if (is.ImportNode(reflectedNode)) {
                this._imports.push(reflectedNode);
            }

            // We don't want to add duplicate declarations when there are functions with overloads
            if (is.DeclarationNode(reflectedNode) && !this._hasDeclaration(reflectedNode)) {
                this._declarations.push(reflectedNode);
            }

            // We don't want to add duplicate exports when there are functions with overloads
            if (is.ExportNode(reflectedNode) && !this._hasExport(reflectedNode)) {
                this._exports.push(reflectedNode);
            }
        }
    }

    private _hasDeclaration(declaration: DeclarationNode): boolean {
        return this._declarations.some(decl => decl.getName() === declaration.getName());
    }

    private _hasExport(exp: ExportNode): boolean {
        if (is.ReExportNode(exp)) {
            return this._exports.some(e => is.ReExportNode(e) && e.getModule() === exp.getModule());
        }

        return this._exports.some(e => e.getName() === exp.getName() && e.getKind() === exp.getKind());
    }

    private _removeNonPublicDeclarations(): void {
        this._declarations = this._declarations.filter(decl => {
            // If the export has an "AS" keyword, we need to use the "originalName"
            const index = this._exports.findIndex(exp => exp.getOriginalName() === decl.getName());
            const isIgnored = !!decl.getJSDoc()?.isIgnored();

            if (index === -1) {
                return false;
            }

            // Remove also the declaration from the exports array
            if (isIgnored) {
                this._exports.splice(index, 1);
            }

            return !isIgnored;
        });
    }
}
