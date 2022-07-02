import { Module } from '../models';
import ts from 'typescript';


export function collect(sourceFile: ts.SourceFile): Module {
    const moduleDoc: Module = {
        path: sourceFile.fileName || '',
        declarations: [],
        exports: [],
        imports: [],
    };

    return moduleDoc;
}
