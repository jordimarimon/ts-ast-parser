import { visitNode } from './visit-node';
import { Module } from './models';
import ts from 'typescript';




/**
 * Loops through each node of the AST and extracts the metadata
 *
 * @param currModule - The TypeScript AST root node
 *
 * @returns The metadata of the module
 */
export function analyze(currModule: ts.SourceFile): Module {
    const moduleDoc: Module = {
        path: currModule.fileName || '',
        declarations: [],
        exports: [],
        imports: [],
    };

    visitNode(currModule, moduleDoc);

    return moduleDoc;
}
