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

    // Create the TS AST for each file
    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.warn(`[TS AST PARSER]: The following file couldn't be found: "${file}"`);
            continue;
        }

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
        // TODO: Provide the decorator and jsdoc handlers in the collect phase
        //  from the user provided options
        modules.push(collect(sourceFile));
    }

    // LINK PHASE
    link(modules);

    // PLUGINS
    if (options.plugins?.length) {
        for (let i = 0; i < modules.length; i++) {
            options.plugins?.forEach(plugin => {
                try {
                    plugin.handler?.(sourceFiles[i], modules[i], modules);
                } catch (error: unknown) {
                    console.error(`The plugin "${plugin.name}" has thrown the following error:`);
                    console.error(error);
                }
            });
        }
    }

    return modules;
}
