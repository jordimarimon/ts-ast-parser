import type { FunctionDeclaration } from '../models/function.js';
import { isFunctionDeclaration } from '../utils/function.js';
import { FunctionNode } from '../nodes/function-node.js';
import type { NodeFactory } from './node-factory.js';
import type { AnalyzerContext } from '../context.js';
import type { Method } from '../models/member.js';
import type ts from 'typescript';


export const functionFactory: NodeFactory<FunctionDeclaration | Method, FunctionNode, ts.VariableStatement | ts.FunctionDeclaration> = {

    isNode: isFunctionDeclaration,

    create: (node: ts.VariableStatement | ts.FunctionDeclaration, context: AnalyzerContext): FunctionNode[] => {
        return [new FunctionNode(node, context)];
    },

};
