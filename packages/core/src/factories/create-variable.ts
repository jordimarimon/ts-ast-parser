import { VariableDeclarationNode } from '../nodes/variable-declaration-node.js';
import { isFunctionDeclaration } from '../utils/function.js';
import { VariableDeclaration } from '../models/variable.js';
import { NodeFactory } from './node-factory.js';
import { AnalyzerContext } from '../context.js';
import ts from 'typescript';


export const variableFactory: NodeFactory<VariableDeclaration, VariableDeclarationNode, ts.VariableStatement> = {

    isNode: (node: ts.Node): node is ts.VariableStatement => {
        return !isFunctionDeclaration(node) && ts.isVariableStatement(node);
    },

    create: (node: ts.VariableStatement, context: AnalyzerContext): VariableDeclarationNode[] => {
        const result: VariableDeclarationNode[] = [];

        for (const declaration of node.declarationList.declarations) {
            result.push(new VariableDeclarationNode(node, declaration, context));
        }

        return result;
    },

};
