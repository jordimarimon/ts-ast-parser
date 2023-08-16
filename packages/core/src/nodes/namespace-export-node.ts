import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedRootNode } from '../reflected-node.js';
import type { AnalyserContext } from '../analyser-context.js';
import type { Export } from '../models/export.js';
import { ExportKind } from '../models/export.js';
import { RootNodeType } from '../models/node.js';
import ts from 'typescript';


/**
 * Represents the reflected node of a namespace export declaration.
 * For example: `export * as bar from './foo.js'`
 */
export class NamespaceExportNode implements ReflectedRootNode<Export, ts.ExportDeclaration> {

    private readonly _node: ts.ExportDeclaration;

    private readonly _context: AnalyserContext;

    constructor(node: ts.ExportDeclaration, context: AnalyserContext) {
        this._node = node;
        this._context = context;
    }

    getName(): string {
        if (!this._node.exportClause || !ts.isNamespaceExport(this._node.exportClause)) {
            return '';
        }

        return this._node.exportClause.name.escapedText ?? '';
    }

    getOriginalName(): string {
        return this.getName();
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getKind(): ExportKind {
        return ExportKind.Namespace;
    }

    getNodeType(): RootNodeType {
        return RootNodeType.Export;
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

    /**
     * The reflected node as a serializable object
     */
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
