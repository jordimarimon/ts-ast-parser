import type { TypeAliasDeclaration } from '../models/type-alias.js';
import { TypeAliasNode } from '../nodes/type-alias-node.js';
import type { NodeFactory } from './node-factory.js';
import type { AnalyserContext } from '../context.js';
import ts from 'typescript';


export const typeAliasFactory: NodeFactory<TypeAliasDeclaration, TypeAliasNode, ts.TypeAliasDeclaration> = {

    isNode: (node: ts.Node): node is ts.TypeAliasDeclaration => ts.isTypeAliasDeclaration(node),

    create: (node: ts.TypeAliasDeclaration, context: AnalyserContext): TypeAliasNode[] => {
        return [new TypeAliasNode(node, context)];
    },

};
