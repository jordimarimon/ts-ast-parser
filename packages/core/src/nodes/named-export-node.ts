import { tryAddProperty } from '../utils/try-add-property.js';
import type { ReflectedRootNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import type { Export } from '../models/export.js';
import { ExportKind } from '../models/export.js';
import { RootNodeType } from '../models/node.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of a named export declaration.
 * For example: `export { x, y as z }`
 */
export class NamedExportNode implements ReflectedRootNode<Export, ts.ExportDeclaration> {

    private readonly _node: ts.ExportDeclaration;

    private readonly _element: ts.ExportSpecifier;

    private readonly _context: ProjectContext;

    constructor(node: ts.ExportDeclaration, element: ts.ExportSpecifier, context: ProjectContext) {
        this._node = node;
        this._element = element;
        this._context = context;
    }

    getName(): string {
        return this._element.name.escapedText ?? '';
    }

    getOriginalName(): string {
        return this._element.propertyName?.escapedText ?? this.getName();
    }

    getKind(): ExportKind {
        return ExportKind.Named;
    }

    getNodeType(): RootNodeType {
        return RootNodeType.Export;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    isTypeOnly(): boolean {
        return !!this._node.isTypeOnly;
    }

    getModule(): string {
        return this._node.moduleSpecifier?.getText() ?? '';
    }

    getTSNode(): ts.ExportDeclaration {
        return this._node;
    }

    isReexport(): boolean {
        return this.getOriginalName() !== this.getName();
    }

    /**
     * The reflected node as a serializable object
     */
    serialize(): Export {
        const originalName = this.getOriginalName();
        const tmpl: Export = {
            name: this.getName(),
            kind: this.getKind(),
        };

        if (originalName !== tmpl.name) {
            tryAddProperty(tmpl, 'originalName', this.getOriginalName());
        }

        tryAddProperty(tmpl, 'typeOnly', this.isTypeOnly());
        tryAddProperty(tmpl, 'module', this.getModule());

        return tmpl;
    }
}
