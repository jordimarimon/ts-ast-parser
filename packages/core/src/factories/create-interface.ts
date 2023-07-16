import type { InterfaceDeclaration } from '../models/interface.js';
import { InterfaceNode } from '../nodes/interface-node.js';
import type { NodeFactory } from './node-factory.js';
import type { AnalyserContext } from '../context.js';
import ts from 'typescript';


export const interfaceFactory: NodeFactory<InterfaceDeclaration, InterfaceNode, ts.InterfaceDeclaration> = {

    isNode: (node: ts.Node): node is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(node),

    create: (node: ts.InterfaceDeclaration, context: AnalyserContext): InterfaceNode[] => {
        return [new InterfaceNode(node, context)];
    },

};
