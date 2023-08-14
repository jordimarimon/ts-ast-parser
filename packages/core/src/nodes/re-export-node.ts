import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedRootNode } from '../reflected-node.js';
import type { AnalyserContext } from '../analyser-context.js';
import type { Export } from '../models/export.js';
import { ExportKind } from '../models/export.js';
import { RootNodeType } from '../models/node.js';
import type ts from 'typescript';


// CASE export * from './foo.js';
export class ReExportNode implements ReflectedRootNode<Export, ts.ExportDeclaration> {

    private readonly _node: ts.ExportDeclaration;

    private readonly _context: AnalyserContext;

    constructor(node: ts.ExportDeclaration, context: AnalyserContext) {
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

    getNodeType(): RootNodeType {
        return RootNodeType.Export;
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getModule(): string {
        return this._node.moduleSpecifier?.getText() ?? '';
    }

    getTSNode(): ts.ExportDeclaration {
        return this._node;
    }

    isTypeOnly(): boolean {
        return !!this._node.isTypeOnly;
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
