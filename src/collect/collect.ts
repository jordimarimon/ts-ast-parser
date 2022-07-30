import { removeNonExportableDeclarations } from './remove-non-exportable-declarations';
import { visitNode } from './visit-node';
import { Options } from '../options';
import { Module } from '../models';
import ts from 'typescript';


export function collect(sourceFile: ts.SourceFile, options: Partial<Options> = {}): Module {
    const moduleDoc: Module = {
        path: sourceFile.fileName || '',
        declarations: [],
        exports: [],
        imports: [],
    };

    visitNode(sourceFile, moduleDoc, options);

    removeNonExportableDeclarations(moduleDoc);

    return moduleDoc;
}
