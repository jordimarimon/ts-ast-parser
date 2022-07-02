import { visitNode } from './visit-node';
import { Module } from '../models';
import ts from 'typescript';


export function link(currModule: ts.SourceFile, moduleDoc: Module): Module {
    visitNode(currModule, moduleDoc);

    return moduleDoc;
}
