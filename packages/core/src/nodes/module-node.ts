import { importFactory } from '../factories/create-import.js';
import { ReflectedNode } from './reflected-node.js';
import { ImportNode } from './import-node.js';
import { Module } from '../models/module.js';
import { NodeType } from '../models/node.js';
import { clean } from '../utils/clean.js';
import { Context } from '../context.js';
import ts from 'typescript';


const factories = [
    importFactory,
];

export class ModuleNode implements ReflectedNode<Module, ts.SourceFile> {

    private readonly _node: ts.SourceFile;

    private readonly _imports: ImportNode[] = [];

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

    toPOJO(): Module {
        const tmpl: Module = {
            path: this.getPath(),
            imports: this._imports.map(imp => imp.toPOJO()),
            exports: [],
            declarations: [],
        };

        clean(tmpl);

        return tmpl;
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
        }
    }

    private _isImportNode(reflectedNode: ReflectedNode): reflectedNode is ImportNode {
        return reflectedNode.getType() === NodeType.Import;
    }

}
