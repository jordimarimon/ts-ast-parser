import type { InterfaceDeclaration } from '../models/interface.js';
import type { AnalyserContext } from '../analyser-context.js';
import { InterfaceNode } from '../nodes/interface-node.js';
import type { NodeFactory } from './node-factory.js';
import ts from 'typescript';


export const interfaceFactory: NodeFactory<InterfaceDeclaration, InterfaceNode, ts.InterfaceDeclaration> = {

    isNode: (node: ts.Node): node is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(node),

    create: (node: ts.InterfaceDeclaration, context: AnalyserContext): InterfaceNode[] => {
        const reflectedNode = context.registerReflectedNode(node, () => new InterfaceNode(node, context));
        return [reflectedNode];
    },

};
