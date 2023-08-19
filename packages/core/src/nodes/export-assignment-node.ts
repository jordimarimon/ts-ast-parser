import type { ReflectedRootNode } from '../reflected-node.js';
import type { ProjectContext } from '../project-context.js';
import type { Export } from '../models/export.js';
import { ExportKind } from '../models/export.js';
import { RootNodeType } from '../models/node.js';
import type ts from 'typescript';


/**
 * Represents the reflected node of an export assignment.
 *
 * For example `export default foo` or `export = class Foo {}`.
 */
export class ExportAssignmentNode implements ReflectedRootNode<Export, ts.ExportAssignment> {

    private readonly _node: ts.ExportAssignment;

    private readonly _context: ProjectContext;

    constructor(node: ts.ExportAssignment, context: ProjectContext) {
        this._node = node;
        this._context = context;
    }

    getName(): string {
        return this._node.expression.getText() ?? '';
    }

    getOriginalName(): string {
        return this.getName();
    }

    getNodeType(): RootNodeType {
        return RootNodeType.Export;
    }

    getContext(): ProjectContext {
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

    /**
     * The reflected node as a serializable object
     */
    serialize(): Export {
        return {
            name: this.getName(),
            kind: this.getKind(),
        };
    }
}
