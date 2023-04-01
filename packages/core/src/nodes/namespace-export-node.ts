import { tryAddProperty } from '../utils/try-add-property.js';
import { Export, ExportKind } from '../models/export.js';
import { ReflectedNode } from './reflected-node.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


// CASE export * as bar from './foo.js';
export class NamespaceExportNode implements ReflectedNode<Export, ts.ExportDeclaration> {

    private readonly _node: ts.ExportDeclaration;

    constructor(node: ts.ExportDeclaration) {
        this._node = node;
    }

    getName(): string {
        if (!this._node.exportClause || !ts.isNamespaceExport(this._node.exportClause)) {
            return '';
        }

        return this._node.exportClause.name?.escapedText ?? '';
    }

    getKind(): ExportKind {
        return ExportKind.Namespace;
    }

    getNodeType(): NodeType {
        return NodeType.Export;
    }

    getModule(): string {
        return this._node.moduleSpecifier?.getText() ?? '';
    }

    getTSNode(): ts.ExportDeclaration {
        return this._node;
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
