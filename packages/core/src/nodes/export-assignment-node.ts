import { Export, ExportKind } from '../models/export.js';
import { ExportNode } from './export-node.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


// Case of:
//      export default 4;
//      export = class Foo {};
export class ExportAssignmentNode implements ExportNode {

    private readonly _node: ts.ExportAssignment;

    constructor(node: ts.ExportAssignment) {
        this._node = node;
    }

    getName(): string {
        return this._node.expression.getText() ?? '';
    }

    getType(): NodeType {
        return NodeType.Export;
    }

    getKind(): ExportKind {
        return this._node.isExportEquals ? ExportKind.equals : ExportKind.default;
    }

    isTypeOnly(): boolean {
        return false;
    }

    getOriginalName(): string {
        return this.getName();
    }

    getTSNode(): ts.ExportAssignment {
        return this._node;
    }

    isReexport(): boolean {
        return false;
    }

    getModule(): string {
        return '';
    }

    toPOJO(): Export {
        return {
            name: this.getName(),
            kind: this.getKind(),
        };
    }

}
