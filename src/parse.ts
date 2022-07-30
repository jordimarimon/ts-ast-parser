import { logError, logWarning } from './utils';
import { Options, Plugin } from './options';
import { collect } from './collect';
import { Module } from './models';
import * as path from 'path';
import ts from 'typescript';
import * as fs from 'fs';


/**
 * Extracts the metadata from a TypeScript code snippet
 *
 * @param source - A string that represents the TypeScript source code
 *
 * @returns The metadata extracted from the source code provided
 */
export function parseFromSource(source: string): Module {
    const sourceFile = createSourceFile(source);

    return collect(sourceFile);
}

/**
 * Given a collection of TypeScript file paths and some configurable options,
 * extracts metadata from the TypeScript Abstract Syntax Tree.
 *
 * @param files - An array of paths where the TypeScripts files are located
 * @param options - Options that can be used to configure the output metadata
 *
 * @returns The metadata of each TypeScript file
 */
export function parseFromFiles(files: string[], options: Partial<Options> = {}): Module[] {
    const modules: Module[] = [];
    const sourceFiles: ts.SourceFile[] = [];

    // Create the TS AST for each file
    for (const file of files) {
        if (!fs.existsSync(file)) {
            logWarning(`The following file couldn't be found: "${file}"`);
            continue;
        }

        let modulePath = file;

        if (path.isAbsolute(modulePath)) {
            modulePath = path.relative(process.cwd(), file);
        }

        const source = fs.readFileSync(modulePath, 'utf8');
        const sourceFile = createSourceFile(source, file);
        const moduleDoc = collect(sourceFile, options);

        sourceFiles.push(sourceFile);
        modules.push(moduleDoc);
    }

    // PLUGINS
    callPlugins(sourceFiles, modules, options.plugins);

    return modules;
}

/**
 * Creates the TypeScript AST from source code
 *
 * @param source - The TypeScript source code
 * @param fileName - Optionally you can specify the file path/name
 *
 * @returns The TypesScript root node of the AST
 */
function createSourceFile(source: string, fileName = ''): ts.SourceFile {
    return ts.createSourceFile(
        fileName,
        source,
        ts.ScriptTarget.ES2020,
        true,
    );
}

/**
 * Calls the plugin handlers provided by the user in a safe environment
 *
 * @param sourceFiles - The TypeScript root nodes of all files
 * @param modules - The metadata that has been extracted
 * @param plugins - The array of user plugins
 *
 */
function callPlugins(sourceFiles: ts.SourceFile[], modules: Module[], plugins: Plugin[] = []): void {
    if (!Array.isArray(plugins)) {
        return;
    }

    for (const sourceFile of sourceFiles) {

        for (const plugin of plugins) {
            try {
                plugin.handler?.(sourceFile, modules);
            } catch (error: unknown) {
                logError(`The plugin "${plugin.name}" has thrown the following error:`, error);
            }
        }

    }
}
