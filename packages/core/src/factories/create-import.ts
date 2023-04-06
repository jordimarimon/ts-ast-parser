import { isDefaultImport, isNamedImport, isNamespaceImport } from '../utils/import.js';
import { NamespaceImportNode } from '../nodes/namespace-import-node.js';
import { DefaultImportNode } from '../nodes/default-import-node.js';
import { NamedImportNode } from '../nodes/named-import-node.js';
import { NodeFactory } from './node-factory.js';
import { AnalyzerContext } from '../context.js';
import { Import } from '../models/import.js';
import { ImportNode } from '../utils/is.js';
import ts from 'typescript';


export const importFactory: NodeFactory<Import, ImportNode, ts.ImportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ImportDeclaration => ts.isImportDeclaration(node),

    create: (node: ts.ImportDeclaration, context: AnalyzerContext): ImportNode[] => {

        if (isDefaultImport(node)) {
            return [new DefaultImportNode(node, context)];
        }

        if (isNamedImport(node)) {
            const elements = (node.importClause?.namedBindings as ts.NamedImports).elements ?? [];
            return elements.map(el => new NamedImportNode(node, el, context));
        }

        if (isNamespaceImport(node)) {
            return [new NamespaceImportNode(node, context)];
        }

        return [];

    },

};
