import { createVirtualCompilerHost } from './virtual-compiler-host';
import { CollectResults, Module } from './models';
import { logError, logWarning } from './utils';
import { Options, Plugin } from './options';
import { collect } from './collect';
import * as path from 'path';
import ts from 'typescript';
import * as fs from 'fs';


/**
 * Extracts the metadata from a TypeScript code snippet
 *
 * @param source - A string that represents the TypeScript source code
 * @param options - Options that can be used to configure the output metadata
 *
 * @returns The metadata extracted from the source code provided
 */
export function parseFromSource(source: string, options: Partial<Options> = {}): Module {
    const fileName = 'unknown.ts';
    const compilerHost = createVirtualCompilerHost(fileName, source);
    const program = ts.createProgram([fileName], {}, compilerHost);
    const sourceFile = program.getSourceFile(fileName);
    const checker = program.getTypeChecker();

    return collect(fileName, sourceFile, checker, options);
}

/**
 * Given a collection of TypeScript file paths and some configurable options,
 * extracts metadata from the TypeScript Abstract Syntax Tree.
 *
 * @param files - An array of paths where the TypeScripts files are located
 * @param options - Options that can be used to configure the output metadata
 * @param compilerOptions - Options to pass to the TypeScript compiler
 *
 * @returns The metadata of each TypeScript file
 */
export function parseFromFiles(
    files: readonly string[],
    options: Partial<Options> = {},
    compilerOptions: ts.CompilerOptions = {},
): Module[] {
    const {modules, sourceFiles} = collectFiles(files, options, compilerOptions);

    callPlugins(sourceFiles, modules, options.plugins);

    return modules;
}

function collectFiles(
    files: readonly string[],
    options: Partial<Options>,
    compilerOptions: ts.CompilerOptions = {},
): CollectResults {
    const modules: Module[] = [];
    const sourceFiles: (ts.SourceFile | undefined)[] = [];
    const program = ts.createProgram(files, compilerOptions);
    const checker = program.getTypeChecker();

    for (const file of files) {
        if (!fs.existsSync(file)) {
            logWarning(`The following file couldn't be found: "${file}"`);
            continue;
        }

        const modulePath = path.relative(process.cwd(), file);
        const sourceFile = program.getSourceFile(file);
        const moduleDoc = collect(modulePath, sourceFile, checker, options);

        sourceFiles.push(sourceFile);
        modules.push(moduleDoc);
    }

    return {modules, sourceFiles};
}

function callPlugins(sourceFiles: (ts.SourceFile | undefined)[], modules: Module[], plugins: Plugin[] = []): void {
    if (!Array.isArray(plugins)) {
        return;
    }

    for (const sourceFile of sourceFiles) {

        for (const plugin of plugins) {
            try {
                plugin?.handler?.(sourceFile, modules);
            } catch (error: unknown) {
                logError(`The plugin "${plugin?.name}" has thrown the following error:`, error);
            }
        }

    }
}
