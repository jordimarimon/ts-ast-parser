import type { VariableDeclaration } from '../models/variable.js';
import { isFunctionDeclaration } from '../utils/function.js';
import { VariableNode } from '../nodes/variable-node.js';
import { isClassDeclaration } from '../utils/class.js';
import type { NodeFactory } from './node-factory.js';
import type { AnalyserContext } from '../context.js';
import ts from 'typescript';

export const variableFactory: NodeFactory<VariableDeclaration, VariableNode, ts.VariableStatement> = {
    isNode: (node: ts.Node): node is ts.VariableStatement => {
        return ts.isVariableStatement(node) && !isFunctionDeclaration(node) && !isClassDeclaration(node);
    },

    create: (node: ts.VariableStatement, context: AnalyserContext): VariableNode[] => {
        const result: VariableNode[] = [];

        for (const declaration of node.declarationList.declarations) {
            result.push(new VariableNode(node, declaration, context));
        }

        return result;
    },
};
