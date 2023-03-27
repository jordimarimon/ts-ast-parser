import { tryAddProperty } from '../utils/try-add-property.js';
import { Export, ExportKind } from '../models/export.js';
import { ExportNode } from './export-node.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


// CASE export * from './foo.js';
export class ReExportNode implements ExportNode {

    private readonly _node: ts.ExportDeclaration;

    constructor(node: ts.ExportDeclaration) {
        this._node = node;
    }

    getName(): string {
        return '*';
    }

    getKind(): ExportKind {
        return ExportKind.star;
    }

    getNodeType(): NodeType {
        return NodeType.Export;
    }

    getModule(): string {
        return this._node.moduleSpecifier?.getText() ?? '';
    }

    getOriginalName(): string {
        return this.getName();
    }

    getTSNode(): ts.ExportDeclaration {
        return this._node;
    }

    isTypeOnly(): boolean {
        return false;
    }

    isReexport(): boolean {
        return false;
    }

    toPOJO(): Export {
        const tmpl: Export = {
            name: this.getName(),
            kind: this.getKind(),
        };

        tryAddProperty(tmpl, 'module', this.getModule());

        return tmpl;
    }

}
