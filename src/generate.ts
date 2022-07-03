import { collect } from './collect';
import { Options } from './options';
import { Module } from './models';
import { link } from './link';
import * as path from 'path';
import ts from 'typescript';
import * as fs from 'fs';


/**
 * Extracts the metadata of the JavaScript modules
 *
 * @param files - An array of absolute paths where the TypeScripts files are located
 * @param options - Options that can be used to add extra metadata
 *
 * @returns The metadata of each JavaScript Module
 */
export function generate(files: string[], options: Partial<Options> = {}): Module[] {
    const sourceFiles: ts.SourceFile[] = [];
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

        sourceFiles.push(currModule);
    }

    // COLLECT PHASE
    for (const sourceFile of sourceFiles) {
        modules.push(collect(sourceFile));
    }

    // LINK PHASE
    for (let i = 0; i < modules.length; i++) {
        link(sourceFiles[i], modules[i]);
    }

    // PLUGINS
    if (options.plugins?.length) {
        for (let i = 0; i < modules.length; i++) {
            options.plugins?.forEach(plugin => plugin(sourceFiles[i], modules));
        }
    }

    return modules;
}
