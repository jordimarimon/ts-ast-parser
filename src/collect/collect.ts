import { visitNode } from './visit-node';
import { Module } from '../models';
import ts from 'typescript';


/**
 * Loops through each node of the AST and extracts the metadata
 *
 * @param sourceFile - The TypeScript AST root node
 *
 * @returns The metadata of the module
 */
export function collect(sourceFile: ts.SourceFile): Module {
    const moduleDoc: Module = {
        path: sourceFile.fileName || '',
        declarations: [],
        exports: [],
        imports: [],
    };

    visitNode(sourceFile, moduleDoc);

    return moduleDoc;
}
