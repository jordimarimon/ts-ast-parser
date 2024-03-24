import type { ProjectContext } from '../project-context.js';
import type { ReflectedNode } from '../reflected-node.js';
import ts from 'typescript';


export class BindingPatternNode implements ReflectedNode<object, ts.BindingPattern> {

    private readonly _node: ts.BindingPattern;

    private readonly _context: ProjectContext;

    constructor(node: ts.BindingPattern, context: ProjectContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): ProjectContext {
        return this._context;
    }

    getTsNode(): ts.BindingPattern {
        return this._node;
    }

    serialize(): object {
        return {};
    }
}
