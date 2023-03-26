import { exportAssignmentFactory, exportDeclarationFactory } from '../factories/create-export.js';
import { importFactory } from '../factories/create-import.js';
import { DeclarationNode } from './declaration-node.js';
import { ReflectedNode } from './reflected-node.js';
import { ExportNode } from './export-node.js';
import { ImportNode } from './import-node.js';
import { Module } from '../models/module.js';
import { NodeType } from '../models/node.js';
import { clean } from '../utils/clean.js';
import { Context } from '../context.js';
import ts from 'typescript';


const factories = [
    importFactory,
    exportDeclarationFactory,
    exportAssignmentFactory,
];

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

    getType(): NodeType {
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

    toPOJO(): Module {
        const tmpl: Module = {
            path: this.getPath(),
            imports: this._imports.map(imp => imp.toPOJO()),
            exports: this._exports.map(exp => exp.toPOJO()),
            declarations: this._declarations.map(dec => dec.toPOJO()),
        };

        clean(tmpl);

        return tmpl;
    }

    private _visitNode(rootNode: ts.Node | ts.SourceFile): void {
        for (const factory of factories) {
            if (factory.isNode(rootNode)) {
                // FIXME(Jordi M.): This is an ugly hack to avoid TS complaining about the type of the factory
                this._add((factory.create as (node: ts.Node) => ReflectedNode[])(rootNode));
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
        return reflectedNode.getType() === NodeType.Import;
    }

    private _isExportNode(reflectedNode: ReflectedNode): reflectedNode is ExportNode {
        return reflectedNode.getType() === NodeType.Export;
    }

    private _isDeclarationNode(reflectedNode: ReflectedNode): reflectedNode is DeclarationNode {
        return reflectedNode.getType() === NodeType.Declaration;
    }

}
