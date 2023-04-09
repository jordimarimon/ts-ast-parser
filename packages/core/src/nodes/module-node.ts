import { DeclarationKind } from '../models/declaration-kind.js';
import { ExportNode, ImportNode, is } from '../utils/is.js';
import { DeclarationNode } from './declaration-node.js';
import { ReflectedNode } from './reflected-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import { AnalyzerContext } from '../context.js';
import factories from '../factories/index.js';
import { Module } from '../models/module.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


export class ModuleNode implements ReflectedNode<Module, ts.SourceFile> {

    private readonly _node: ts.SourceFile;

    private readonly _imports: ImportNode[] = [];

    private readonly _context: AnalyzerContext;

    private _exports: ExportNode[] = [];

    private _declarations: DeclarationNode[] = [];

    constructor(node: ts.SourceFile, context: AnalyzerContext) {
        this._node = node;
        this._context = context;

        this._visitNode(node);

        this._removeDuplicatedExports();
        this._removeNonPublicDeclarations();
    }

    getTSNode(): ts.SourceFile {
        return this._node;
    }

    getPath(): string {
        return this._context.normalizePath(this._node.fileName);
    }

    getNodeType(): NodeType {
        return NodeType.Module;
    }

    getContext(): AnalyzerContext {
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
            return decl.getJSDoc().getTag(JSDocTagName.category)?.getValue<string>() === category;
        });
    }

    toPOJO(): Module {
        return {
            path: this.getPath(),
            imports: this.getImports().map(imp => imp.toPOJO()),
            declarations: this.getDeclarations().map(dec => dec.toPOJO()),
            exports: this.getExports().map(exp => exp.toPOJO()),
        };
    }

    private _visitNode(rootNode: ts.Node | ts.SourceFile): void {
        for (const factory of factories) {
            if (factory.isNode(rootNode)) {
                this._add(factory.create(rootNode, this._context));
            }
        }

        ts.forEachChild(rootNode, node => this._visitNode(node));
    }

    private _add(reflectedNodes: ReflectedNode[]): void {
        for (const reflectedNode of reflectedNodes) {
            if (is.ImportNode(reflectedNode)) {
                this._imports.push(reflectedNode);
            }

            if (is.ExportNode(reflectedNode)) {
                this._exports.push(reflectedNode);
            }

            if (is.DeclarationNode(reflectedNode)) {
                this._declarations.push(reflectedNode);
            }
        }
    }

    private _removeNonPublicDeclarations(): void {
        this._declarations = this._declarations.filter(decl => {
            // If the export has an "AS" keyword, we need to use the "originalName"
            const hasExport = this._exports.some(exp => exp.getOriginalName() === decl.getName());

            return hasExport && !decl.getJSDoc().isIgnored();
        });
    }

    private _removeDuplicatedExports(): void {
        this._exports = this._exports.filter((value, index, exports) => {
            return index === exports.findIndex(e => {
                return e.getName() === value.getName() && e.getKind() === value.getKind();
            });
        });
    }

}
