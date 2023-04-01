import { Export, ExportKind } from '../models/export.js';
import { ReflectedNode } from './reflected-node.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


// Case of:
//      export default 4;
//      export = class Foo {};
export class ExportAssignmentNode implements ReflectedNode<Export, ts.ExportAssignment> {

    private readonly _node: ts.ExportAssignment;

    constructor(node: ts.ExportAssignment) {
        this._node = node;
    }

    getName(): string {
        return this._node.expression.getText() ?? '';
    }

    getNodeType(): NodeType {
        return NodeType.Export;
    }

    getKind(): ExportKind {
        return this._node.isExportEquals ? ExportKind.Equals : ExportKind.Default;
    }

    isTypeOnly(): boolean {
        return false;
    }

    getTSNode(): ts.ExportAssignment {
        return this._node;
    }

    toPOJO(): Export {
        return {
            name: this.getName(),
            kind: this.getKind(),
        };
    }

}
