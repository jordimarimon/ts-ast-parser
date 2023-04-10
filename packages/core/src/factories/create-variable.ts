import { isFunctionDeclaration } from '../utils/function.js';
import { VariableDeclaration } from '../models/variable.js';
import { VariableNode } from '../nodes/variable-node.js';
import { isClassDeclaration } from '../utils/class.js';
import { NodeFactory } from './node-factory.js';
import { AnalyzerContext } from '../context.js';
import ts from 'typescript';


export const variableFactory: NodeFactory<VariableDeclaration, VariableNode, ts.VariableStatement> = {

    isNode: (node: ts.Node): node is ts.VariableStatement => {
        return ts.isVariableStatement(node) && !isFunctionDeclaration(node) && !isClassDeclaration(node);
    },

    create: (node: ts.VariableStatement, context: AnalyzerContext): VariableNode[] => {
        const result: VariableNode[] = [];

        for (const declaration of node.declarationList.declarations) {
            result.push(new VariableNode(node, declaration, context));
        }

        return result;
    },

};
