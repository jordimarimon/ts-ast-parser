import { visitNode } from './visit-node.js';
import { Module } from './models/index.js';
import { Context } from './context.js';
import ts from 'typescript';


export function collect(sourceFile: ts.SourceFile | undefined): Module {
    const moduleDoc: Module = {
        path: Context.normalizePath(sourceFile?.fileName),
        imports: [],
        declarations: [],
        exports: [],
    };

    if (sourceFile == null) {
        return moduleDoc;
    }

    visitNode(sourceFile, moduleDoc);

    return moduleDoc;
}
