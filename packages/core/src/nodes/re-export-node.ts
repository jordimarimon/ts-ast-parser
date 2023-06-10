import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedNode } from './reflected-node.js';
import type { AnalyzerContext } from '../context.js';
import type { Export } from '../models/export.js';
import { ExportKind } from '../models/export.js';
import { NodeType } from '../models/node.js';
import type ts from 'typescript';


// CASE export * from './foo.js';
export class ReExportNode implements ReflectedNode<Export, ts.ExportDeclaration> {

    private readonly _node: ts.ExportDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ExportDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getName(): string {
        return '*';
    }

    getOriginalName(): string {
        return this.getName();
    }

    getKind(): ExportKind {
        return ExportKind.Star;
    }

    getNodeType(): NodeType {
        return NodeType.Export;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getModule(): string {
        return this._node.moduleSpecifier?.getText() ?? '';
    }

    getTSNode(): ts.ExportDeclaration {
        return this._node;
    }

    isTypeOnly(): boolean {
        return this._node.isTypeOnly ?? false;
    }

    serialize(): Export {
        const tmpl: Export = {
            name: this.getName(),
            kind: this.getKind(),
        };

        tryAddProperty(tmpl, 'module', this.getModule());
        tryAddProperty(tmpl, 'typeOnly', this.isTypeOnly());

        return tmpl;
    }

}
