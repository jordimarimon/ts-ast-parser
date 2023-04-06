import { DeclarationKind } from '../models/declaration-kind.js';
import { DeclarationNode } from './declaration-node.js';
import { ExportNode, ImportNode, is } from '../utils/is.js';
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

    private readonly _exports: ExportNode[] = [];

    private readonly _declarations: DeclarationNode[] = [];

    private readonly _context: AnalyzerContext;

    constructor(node: ts.SourceFile, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
        this._visitNode(node);
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
        let isFactoryFound = false;

        for (const factory of factories) {
            if (factory.isNode(rootNode)) {
                isFactoryFound = true;
                this._add(factory.create(rootNode, this._context));
            }
        }

        if (!isFactoryFound) {
            ts.forEachChild(rootNode, node => this._visitNode(node));
        }
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

}
