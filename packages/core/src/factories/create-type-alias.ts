import { TypeAliasDeclaration } from '../models/type-alias.js';
import { TypeAliasNode } from '../nodes/type-alias-node.js';
import { NodeFactory } from './node-factory.js';
import ts from 'typescript';


export const typeAliasFactory: NodeFactory<TypeAliasDeclaration, TypeAliasNode, ts.TypeAliasDeclaration> = {

    isNode: (node: ts.Node): node is ts.TypeAliasDeclaration => ts.isTypeAliasDeclaration(node),

    create: (node: ts.TypeAliasDeclaration): TypeAliasNode[] => {
        return [new TypeAliasNode(node)];
    },

};
