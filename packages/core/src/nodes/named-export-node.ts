import { tryAddProperty } from '../utils/try-add-property.js';
import { Export, ExportKind } from '../models/export.js';
import { ReflectedNode } from './reflected-node.js';
import { AnalyzerContext } from '../context.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


// CASE of "export { x, y as z };"
export class NamedExportNode implements ReflectedNode<Export, ts.ExportDeclaration> {

    private readonly _node: ts.ExportDeclaration;

    private readonly _element: ts.ExportSpecifier;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ExportDeclaration, element: ts.ExportSpecifier, context: AnalyzerContext) {
        this._node = node;
        this._element = element;
        this._context = context;
    }

    getName(): string {
        return this._element.name?.escapedText ?? '';
    }

    getKind(): ExportKind {
        return ExportKind.Named;
    }

    getNodeType(): NodeType {
        return NodeType.Export;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    isTypeOnly(): boolean {
        return this._node.isTypeOnly ?? false;
    }

    getOriginalName(): string {
        return this._element.propertyName?.escapedText ?? '';
    }

    getModule(): string {
        return this._node.moduleSpecifier?.getText() ?? '';
    }

    getTSNode(): ts.ExportDeclaration {
        return this._node;
    }

    isReexport(): boolean {
        return this.getOriginalName() !== '';
    }

    toPOJO(): Export {
        const tmpl: Export = {
            name: this.getName(),
            kind: this.getKind(),
        };

        tryAddProperty(tmpl, 'originalName', this.getOriginalName());
        tryAddProperty(tmpl, 'isTypeOnly', this.isTypeOnly());
        tryAddProperty(tmpl, 'module', this.getModule());

        return tmpl;
    }

}