import { removeNonExportableDeclarations } from './remove-non-exportable-declarations';
import { visitNode } from './visit-node';
import { Module } from '../models';
import ts from 'typescript';


export function collect(fileName: string, sourceFile: ts.SourceFile | undefined): Module {
    const moduleDoc: Module = {
        path: fileName || '',
        declarations: [],
        exports: [],
        imports: [],
    };

    if (sourceFile == null) {
        return moduleDoc;
    }

    visitNode(sourceFile, moduleDoc);

    removeNonExportableDeclarations(moduleDoc);

    // TODO(Jordi M.): Link Phase. Cross-reference any user defined type and inheritances

    return moduleDoc;
}
