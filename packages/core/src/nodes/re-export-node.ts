import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedRootNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import type { Export } from '../models/export.js';
import { ExportKind } from '../models/export.js';
import { RootNodeType } from '../models/node.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of a re-export declaration.
 * For example: `export * from './foo.js'`
 */
export class ReExportNode implements ReflectedRootNode<Export, ts.ExportDeclaration> {

    private readonly _node: ts.ExportDeclaration;

    private readonly _context: ProjectContext;

    constructor(node: ts.ExportDeclaration, context: ProjectContext) {
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

    getContext(): ProjectContext {
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
