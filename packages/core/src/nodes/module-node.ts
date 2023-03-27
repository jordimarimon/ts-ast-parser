import { DeclarationKind } from '../models/declaration-kind.js';
import { DeclarationNode } from './declaration-node.js';
import { ReflectedNode } from './reflected-node.js';
import { JSDocTagName } from '../models/js-doc.js';
import { ExportNode } from './export-node.js';
import { ImportNode } from './import-node.js';
import factories from '../factories/index.js';
import { Module } from '../models/module.js';
import { NodeType } from '../models/node.js';
import { Context } from '../context.js';
import ts from 'typescript';


export class ModuleNode implements ReflectedNode<Module, ts.SourceFile> {

    private readonly _node: ts.SourceFile;

    private readonly _imports: ImportNode[] = [];

    private readonly _exports: ExportNode[] = [];

    private readonly _declarations: DeclarationNode[] = [];

    constructor(node: ts.SourceFile) {
        this._node = node;
        this._visitNode(node);
    }

    getTSNode(): ts.SourceFile {
        return this._node;
    }

    getPath(): string {
        return Context.normalizePath(this._node.fileName);
    }

    getNodeType(): NodeType {
        return NodeType.Module;
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
        return this._declarations.filter(decl => decl.getKind() === kind);
    }

    getDeclarationByName(name: string): DeclarationNode | null {
        return this._declarations.find(decl => decl.getName() === name) ?? null;
    }

    getAllDeclarationsInNamespace(name: string): DeclarationNode[] {
        return this._declarations.filter(decl => decl.getNamespace() === name);
    }

    getDeclarationsByCategory(category: string): DeclarationNode[] {
        return this._declarations.filter(decl => {
            return decl.getJSDoc().getJSDocTag(JSDocTagName.category)?.getDescription() === category;
        });
    }

    toPOJO(): Module {
        return {
            path: this.getPath(),
            imports: this._imports.map(imp => imp.toPOJO()),
            exports: this._exports.map(exp => exp.toPOJO()),
            declarations: this._declarations.map(dec => dec.toPOJO()),
        };
    }

    private _visitNode(rootNode: ts.Node | ts.SourceFile): void {
        for (const factory of factories) {
            if (factory.isNode(rootNode)) {
                this._add(factory.create(rootNode));
            }
        }

        ts.forEachChild(rootNode, node => this._visitNode(node));
    }

    private _add(reflectedNodes: ReflectedNode[]): void {
        for (const reflectedNode of reflectedNodes) {
            if (this._isImportNode(reflectedNode)) {
                this._imports.push(reflectedNode);
            }

            if (this._isExportNode(reflectedNode)) {
                this._exports.push(reflectedNode);
            }

            if (this._isDeclarationNode(reflectedNode)) {
                this._declarations.push(reflectedNode);
            }
        }
    }

    private _isImportNode(reflectedNode: ReflectedNode): reflectedNode is ImportNode {
        return reflectedNode.getNodeType() === NodeType.Import;
    }

    private _isExportNode(reflectedNode: ReflectedNode): reflectedNode is ExportNode {
        return reflectedNode.getNodeType() === NodeType.Export;
    }

    private _isDeclarationNode(reflectedNode: ReflectedNode): reflectedNode is DeclarationNode {
        return reflectedNode.getNodeType() === NodeType.Declaration;
    }

}
