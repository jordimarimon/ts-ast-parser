import { InterfaceDeclaration } from '../models/interface.js';
import { InterfaceNode } from '../nodes/interface-node.js';
import { NodeFactory } from './node-factory.js';
import { AnalyzerContext } from '../context.js';
import ts from 'typescript';


export const interfaceFactory: NodeFactory<InterfaceDeclaration, InterfaceNode, ts.InterfaceDeclaration> = {

    isNode: (node: ts.Node): node is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(node),

    create: (node: ts.InterfaceDeclaration, context: AnalyzerContext): InterfaceNode[] => {
        return [new InterfaceNode(node, context)];
    },

};
