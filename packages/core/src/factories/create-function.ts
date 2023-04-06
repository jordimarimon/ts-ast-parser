import { isFunctionDeclaration } from '../utils/function.js';
import { FunctionDeclaration } from '../models/function.js';
import { FunctionNode } from '../nodes/function-node.js';
import { ClassMethod } from '../models/class.js';
import { NodeFactory } from './node-factory.js';
import { AnalyzerContext } from '../context.js';
import ts from 'typescript';


export const functionFactory: NodeFactory<FunctionDeclaration | ClassMethod, FunctionNode, ts.VariableStatement | ts.FunctionDeclaration> = {

    isNode: isFunctionDeclaration,

    create: (node: ts.VariableStatement | ts.FunctionDeclaration, context: AnalyzerContext): FunctionNode[] => {
        return [new FunctionNode(node, context)];
    },

};
