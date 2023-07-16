import { importFactory, declarationFactories, exportFactories } from '../factories/index.js';
import type { DeclarationKind } from '../models/declaration-kind.js';
import type { ExportNode, ImportNode } from '../utils/is.js';
import type { DeclarationNode } from './declaration-node.js';
import type { ReflectedNode } from './reflected-node.js';
import type { AnalyserContext } from '../context.js';
import { JSDocTagName } from '../models/js-doc.js';
import type { Module } from '../models/module.js';
import { NodeType } from '../models/node.js';
import { isBrowser } from '../context.js';
import { is } from '../utils/is.js';
import ts from 'typescript';


export class ModuleNode implements ReflectedNode<Module, ts.SourceFile> {

    private readonly _node: ts.SourceFile;

    private readonly _imports: ImportNode[] = [];

    private readonly _context: AnalyserContext;

    private readonly _exports: ExportNode[] = [];

    private _declarations: DeclarationNode[] = [];

    constructor(node: ts.SourceFile, context: AnalyserContext) {
        this._node = node;
        this._context = context;

        this._visitNode(node);
        this._removeNonPublicDeclarations();
    }

    /**
     * The TS AST node for the file
     */
    getTSNode(): ts.SourceFile {
        return this._node;
    }

    /**
     * The path to the source file for this module.
     */
    getSourcePath(): string {
        return this._context.normalizePath(this._node.fileName);
    }

    /**
     * The path where the JS file will be output by the TS Compiler
     */
    getOutputPath(): string {
        const sourcePath = this.getSourcePath();

        // If the source file was already JS, just return that
        if (sourcePath.endsWith('js')) {
            return sourcePath;
        }

        if (sourcePath.endsWith('.d.ts') || !this._context.commandLine) {
            return '';
        }

        // Use the TS API to determine where the associated JS will be output based
        // on tsconfig settings.
        const absolutePath = isBrowser ? sourcePath : ([process.cwd(), sourcePath].join('/'));
        const outputPath = ts
            .getOutputFileNames(this._context.commandLine, absolutePath, false)
            .filter(f => f.endsWith('.js'))[0];

        return this._context.normalizePath(outputPath);
    }

    getNodeType(): NodeType {
        return NodeType.Module;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getImports(): ImportNode[] {
        return this._imports;
    }

    getExports(): ExportNode[] {
        return this._exports;
    }

    getDeclarations(): DeclarationNode[] {
        return this._declarations;
    }

    getDeclarationByKind(kind: DeclarationKind): DeclarationNode[] {
        return this.getDeclarations().filter(decl => decl.getKind() === kind);
    }

    getDeclarationByName(name: string): DeclarationNode | null {
        return this.getDeclarations().find(decl => decl.getName() === name) ?? null;
    }

    getAllDeclarationsInNamespace(name: string): DeclarationNode[] {
        return this.getDeclarations().filter(decl => decl.getNamespace() === name);
    }

    getDeclarationsByCategory(category: string): DeclarationNode[] {
        return this.getDeclarations().filter(decl => {
            return decl.getJSDoc()?.getTag(JSDocTagName.category)?.getValue<string>() === category;
        });
    }

    serialize(): Module {
        return {
            sourcePath: this.getSourcePath(),
            outputPath: this.getOutputPath(),
            imports: this.getImports().map(imp => imp.serialize()),
            declarations: this.getDeclarations().map(dec => dec.serialize()),
            exports: this.getExports().map(exp => exp.serialize()),
        };
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

    private _add(reflectedNodes: ReflectedNode[]): void {
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
