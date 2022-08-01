import { removeNonExportableDeclarations } from './remove-non-exportable-declarations';
import { visitNode } from './visit-node';
import { Options } from '../options';
import { Module } from '../models';
import ts from 'typescript';


export function collect(
    fileName: string,
    sourceFile: ts.SourceFile | undefined,
    checker: ts.TypeChecker,
    options: Partial<Options> = {},
): Module {
    const moduleDoc: Module = {
        path: fileName || '',
        declarations: [],
        exports: [],
        imports: [],
    };

    if (sourceFile == null) {
        return moduleDoc;
    }

    visitNode(sourceFile, checker, moduleDoc, options);

    removeNonExportableDeclarations(moduleDoc);

    // TODO(Jordi M.): Link Phase -> User Defined Types and inheritance

    return moduleDoc;
}
