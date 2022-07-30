import { removeNonExportableDeclarations } from './remove-non-exportable-declarations';
import { visitNode } from './visit-node';
import { Options } from '../options';
import { Module } from '../models';
import ts from 'typescript';


/**
 * Loops through each node of the AST and extracts the metadata
 *
 * @param sourceFile - The TypeScript AST root node
 * @param _options -
 *
 * @returns The metadata of the module
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function collect(sourceFile: ts.SourceFile, _options: Partial<Options> = {}): Module {
    const moduleDoc: Module = {
        path: sourceFile.fileName || '',
        declarations: [],
        exports: [],
        imports: [],
    };

    visitNode(sourceFile, moduleDoc);

    removeNonExportableDeclarations(moduleDoc);

    return moduleDoc;
}
