import { collect } from './collect';
import { Options } from './options';
import { Module } from './models';
import * as path from 'path';
import ts from 'typescript';
import * as fs from 'fs';


/**
 * Extracts the metadata of the TypeScript files
 *
 * @param files - An array of absolute paths where the TypeScripts files are located
 * @param options - Options that can be used to add extra metadata
 *
 * @returns The metadata of each TypeScript file
 */
export function parseFromFiles(files: string[], options: Partial<Options> = {}): Module[] {
    const modules: Module[] = [];

    // Create the TS AST for each file
    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.warn(`[TS AST PARSER]: The following file couldn't be found: "${file}"`);
            continue;
        }

        const relativeModulePath = path.relative(process.cwd(), file);
        const source = fs.readFileSync(relativeModulePath, 'utf8');
        const moduleDoc = parseFromSource(source, relativeModulePath, options);

        modules.push(moduleDoc);
    }

    return modules;
}

/**
 * Extracts the metadata from a TypeScript code snippet
 *
 * @param source - The TypeScript source code
 * @param fileName - The path where the source code is located
 * @param options - Options that can be used to add extra metadata
 *
 * @returns The metadata extracted from the source code provided
 */
export function parseFromSource(source: string, fileName = '', options: Partial<Options> = {}): Module {
    const sourceFile = ts.createSourceFile(
        fileName,
        source,
        ts.ScriptTarget.ES2020,
        true,
    );

    // COLLECT PHASE
    // TODO(Jordi M.): Provide the decorator and jsdoc handlers in the collect phase
    //  from the user provided options
    const moduleDoc = collect(sourceFile);

    // PLUGINS
    if (options.plugins?.length) {
        for (const plugin of options.plugins) {
            try {
                plugin.handler?.(sourceFile, moduleDoc);
            } catch (error: unknown) {
                console.error(`The plugin "${plugin.name}" has thrown the following error:`);
                console.error(error);
            }
        }
    }

    return moduleDoc;
}
