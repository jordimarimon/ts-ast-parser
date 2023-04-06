import { FunctionSignature } from '../models/function.js';
import { DeclarationNode } from './declaration-node.js';
import { AnalyzerContext } from '../context.js';
import ts from 'typescript';


export class SignatureNode implements DeclarationNode<FunctionSignature, ts.Signature> {

    private readonly _node: ts.Signature;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.Signature, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    toPOJO(): FunctionSignature {
        // TODO
    }

}
