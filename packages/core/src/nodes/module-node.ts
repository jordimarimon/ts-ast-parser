import type { DeclarationKind } from '../models/declaration.js';
import { tryAddProperty } from '../utils/try-add-property.js';
import type { ProjectContext } from '../project-context.js';
import type { ReflectedNode } from '../reflected-node.js';
import { createNode } from '../factories/create-node.js';
import type { DeclarationLike } from '../utils/types.js';
import type { Module } from '../models/module.js';
import { CommentNode } from './comment-node.js';
import ts from 'typescript';


/**
 * Represents a reflected module as a collection of imports, exports and
 * class/interface/function/type-alias/enum declarations
 */
export class ModuleNode implements ReflectedNode<Module, ts.SourceFile> {

    private _statements: ReflectedNode[] = [];

    private readonly _node: ts.SourceFile;

    private readonly _context: ProjectContext;

    private readonly _jsDoc: CommentNode;

    constructor(node: ts.SourceFile, context: ProjectContext) {
        this._node = node;
        this._context = context;
        this._jsDoc = new CommentNode(node, context);

        ts.forEachChild(node, child => this._visitNode(child));
    }

    /**
     * The original TypeScript node
     *
     * @returns The TypeScript AST node associated with this module
     */
    getTsNode(): ts.SourceFile {
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
        const commandLine = this._context.getCommandLine();

        // If the source file was already JS, just return that
        if (sourcePath.endsWith('js')) {
            return system.normalizePath(sourcePath);
        }

        // Use the TS API to determine where the associated JS will be output based
        // on tsconfig settings.
        const absolutePath = system.getAbsolutePath(sourcePath);
        const outputPath = ts.getOutputFileNames(commandLine, absolutePath, false)[0];

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
    getImports(): ReflectedNode[] {
        return [];
    }

    /**
     * All the export declarations found in the source file
     *
     * @returns The reflected export declarations
     */
    getExports(): ReflectedNode[] {
        return [];
    }

    /**
     * All the class/interface/function/type-alias/enum declarations found
     * in the source file
     *
     * @returns The reflected declaration nodes
     */
    getDeclarations(): DeclarationLike[] {
        return [];
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
    getDeclarationByKind(kind: DeclarationKind): DeclarationLike[] {
        return this.getDeclarations().filter(decl => decl.getKind() === kind);
    }

    /**
     * Finds a declaration based on it's name
     *
     * @param name - The declaration name
     * @returns The matched declaration found if any
     */
    getDeclarationByName(name: string): DeclarationLike | null {
        return this.getDeclarations().find(decl => decl.getName() === name) ?? null;
    }

    /**
     * Returns all the declarations that have the tag `@category`
     * with the specified name
     *
     * @param category - The category name
     * @returns All declaration nodes found
     */
    getDeclarationsByCategory(category: string): DeclarationLike[] {
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

    private _visitNode(node: ts.Node): void {
        if (ts.SyntaxKind.EndOfFileToken === node.kind) {
            return;
        }

        this._statements.push(createNode(node, this._context));
    }
}
