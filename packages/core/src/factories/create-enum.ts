import type { EnumDeclaration } from '../models/enum.js';
import type { NodeFactory } from './node-factory.js';
import type { AnalyserContext } from '../context.js';
import { EnumNode } from '../nodes/enum-node.js';
import ts from 'typescript';

export const enumFactory: NodeFactory<EnumDeclaration, EnumNode, ts.EnumDeclaration> = {
    isNode: (node: ts.Node): node is ts.EnumDeclaration => {
        return ts.isEnumDeclaration(node);
    },

    create: (node: ts.EnumDeclaration, context: AnalyserContext): EnumNode[] => {
        return [new EnumNode(node, context)];
    },
};
