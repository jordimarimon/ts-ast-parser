import { removeNonExportableDeclarations } from './remove-non-exportable-declarations.js';
import { visitNode } from './visit-node.js';
import { Module } from '../models/index.js';
import ts from 'typescript';


export function collect(fileName: string, sourceFile: ts.SourceFile | undefined): Module {
    const moduleDoc: Module = {
        path: fileName || '',
        imports: [],
        declarations: [],
        exports: [],
    };

    if (sourceFile == null) {
        return moduleDoc;
    }

    visitNode(sourceFile, moduleDoc);

    removeNonExportableDeclarations(moduleDoc);

    // TODO(Jordi M.): Link Phase. Cross-reference any user defined type/interface and inheritances

    return moduleDoc;
}
