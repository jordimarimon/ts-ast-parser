import { analyze } from './analyse';
import { Module } from './models';
import * as path from 'path';
import ts from 'typescript';
import * as fs from 'fs';


/**
 * Extracts the metadata of the JavaScript modules
 *
 * @param files - An array of absolute paths where the TypeScripts files are located
 *
 * @returns The metadata of each JavaScript Module
 */
export function generate(files: string[]): Module[] {
    const modules: Module[] = [];

    for (const file of files) {
        const relativeModulePath = path.relative(process.cwd(), file);
        const source = fs.readFileSync(relativeModulePath, 'utf8');
        const currModule = ts.createSourceFile(
            relativeModulePath,
            source,
            ts.ScriptTarget.ES2020,
            true,
        );

        modules.push(analyze(currModule));
    }

    return modules;
}
