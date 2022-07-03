import { collect } from './collect';
import { Options } from './options';
import { Module } from './models';
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

    // TODO: Provide the decorator and jsdoc handlers in the collect phase
    //  from the user provided options

    // COLLECT PHASE
    for (const sourceFile of sourceFiles) {
        modules.push(collect(sourceFile));
    }

    // TODO: LINK PHASE needs to be implemented
    //  Here we need to cross reference everything we have collected in the previous phase

    // PLUGINS
    if (options.plugins?.length) {
        for (let i = 0; i < modules.length; i++) {
            options.plugins?.forEach(plugin => {
                try {
                    plugin.handler?.(sourceFiles[i], modules[i], modules);
                } catch (error: unknown) {
                    console.error(`The plugin ${plugin.name} has thrown the following error:`);
                    console.error(error);
                }
            });
        }
    }

    return modules;
}
