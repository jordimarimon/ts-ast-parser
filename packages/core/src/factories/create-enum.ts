import { EnumDeclaration } from '../models/enum.js';
import { EnumNode } from '../nodes/enum-node.js';
import { NodeFactory } from './node-factory.js';
import { AnalyzerContext } from '../context.js';
import ts from 'typescript';


export const enumFactory: NodeFactory<EnumDeclaration, EnumNode, ts.EnumDeclaration> = {

    isNode: (node: ts.Node): node is ts.EnumDeclaration => {
        return ts.isEnumDeclaration(node);
    },

    create: (node: ts.EnumDeclaration, context: AnalyzerContext): EnumNode[] => {
        return [new EnumNode(node, context)];
    },

};
