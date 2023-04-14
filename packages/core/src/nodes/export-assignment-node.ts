import type { ReflectedNode } from './reflected-node.js';
import type { AnalyzerContext } from '../context.js';
import type { Export } from '../models/export.js';
import { ExportKind } from '../models/export.js';
import { NodeType } from '../models/node.js';
import ts from 'typescript';


// Case of:
//      export default 4;
//      export = class Foo {};
export class ExportAssignmentNode implements ReflectedNode<Export, ts.ExportAssignment> {

    private readonly _node: ts.ExportAssignment;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ExportAssignment, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getName(): string {
        return this._node.expression.getText() ?? '';
    }

    getOriginalName(): string {
        return this.getName();
    }

    getNodeType(): NodeType {
        return NodeType.Export;
    }

    getContext(): AnalyzerContext {
        return this._context;
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

    serialize(): Export {
        return {
            name: this.getName(),
            kind: this.getKind(),
        };
    }

}
