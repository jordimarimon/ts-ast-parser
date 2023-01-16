import { DefaultImportNode } from '../nodes/default-import-node.js';
import { ImportNode } from '../nodes/import-node.js';
import { isDefaultImport } from '../utils/import.js';
import { NodeFactory } from './node-factory.js';
import { Import } from '../models/import.js';
import ts from 'typescript';


export const importFactory: NodeFactory<Import, ImportNode, ts.ImportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ImportDeclaration => ts.isImportDeclaration(node),

    create: (node: ts.ImportDeclaration): ImportNode[] => {

        if (isDefaultImport(node)) {
            return [new DefaultImportNode(node)];
        }

        return [];

    },

};
