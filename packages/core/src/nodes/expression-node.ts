import type { ProjectContext } from '../project-context.js';
import type { ReflectedNode } from '../reflected-node.js';
import ts from 'typescript';


export class ExpressionNode implements ReflectedNode<object, ts.Expression> {

    private readonly _node: ts.Expression;

    private readonly _context: ProjectContext;

    constructor(node: ts.Expression, context: ProjectContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTsNode(): ts.Expression {
        return this._node;
    }

    getText(): string {

    }

    serialize(): object {
    }

}
