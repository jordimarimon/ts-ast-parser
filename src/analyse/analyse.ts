import { visitNode } from './visit-node';
import { Module } from '../models';
import ts from 'typescript';


/**
 * Loops through each node of the AST and extracts the metadata
 *
 * @param currModule - The TypeScript AST root node
 * @param moduleDoc -
 *
 * @returns The metadata of the module
 */
export function analyze(currModule: ts.SourceFile, moduleDoc: Module): Module {
    visitNode(currModule, moduleDoc);

    return moduleDoc;
}
