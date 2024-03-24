import { ExpressionWithTypeArgumentsNode } from './expression-with-type-arguments-node.js';
import  { type ProjectContext } from '../project-context.js';
import type { ReflectedNode } from '../reflected-node.js';
import ts from 'typescript';


export class HeritageClauseNode implements ReflectedNode<object, ts.HeritageClause> {

    private readonly _node: ts.HeritageClause;

    private readonly _context: ProjectContext;

    constructor(node: ts.HeritageClause, context: ProjectContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTsNode(): ts.HeritageClause {
        return this._node;
    }

    serialize(): object {
        return {};
    }

    getTypes(): ExpressionWithTypeArgumentsNode[] {
        return this._node.types.map(t => {
            return new ExpressionWithTypeArgumentsNode(t, this._context);
        })
    }
}
