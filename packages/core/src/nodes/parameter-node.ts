import { ReflectedNode } from './reflected-node.js';
import { Parameter } from '../models/parameter.js';
import { AnalyzerContext } from '../context.js';
import ts from 'typescript';


export class ParameterNode implements ReflectedNode<Parameter, ts.ParameterDeclaration> {

    private readonly _node: ts.ParameterDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ParameterDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

}
