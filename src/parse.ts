import { createCompilerHost } from './compiler-host';
import { Options } from './options';
import { collect } from './collect';
import { Context } from './context';
import { logError } from './utils';
import { Module } from './models';
import * as path from 'path';
import ts from 'typescript';


/**
 * Extracts the metadata from a TypeScript code snippet
 *
 * @param source - A string that represents the TypeScript source code
 * @param options - Options that can be used to configure the output metadata
 * @param compilerOptions - Options to pass to the TypeScript compiler
 *
 * @returns The metadata extracted from the source code provided
 */
export function parseFromSource(
    source: string,
    options: Partial<Options> = {},
    compilerOptions: ts.CompilerOptions = {},
): Module {
    const fileName = 'unknown.ts';
    const compilerHost = createCompilerHost(fileName, source);
    const program = ts.createProgram([fileName], compilerOptions, compilerHost);
    const sourceFile = program.getSourceFile(fileName);

    Context.checker = program.getTypeChecker();
    Context.options = options;

    return collect(fileName, sourceFile);
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
    const modules: Module[] = [];
    const sourceFiles: (ts.SourceFile | undefined)[] = [];
    const program = ts.createProgram(files, compilerOptions);

    Context.options = options;
    Context.checker = program.getTypeChecker();

    for (const file of files) {
        const modulePath = path.relative(process.cwd(), file);
        const sourceFile = program.getSourceFile(file);
        const moduleDoc = collect(modulePath, sourceFile);

        sourceFiles.push(sourceFile);
        modules.push(moduleDoc);
    }

    callPlugins(sourceFiles, modules);

    return modules;
}

function callPlugins(sourceFiles: (ts.SourceFile | undefined)[], modules: Module[]): void {
    const plugins = Context.options.plugins ?? [];
    const checker = Context.checker;

    if (!Array.isArray(plugins)) {
        return;
    }

    for (const sourceFile of sourceFiles) {

        for (const plugin of plugins) {
            try {
                plugin?.handler?.(sourceFile, modules, checker);
            } catch (error: unknown) {
                logError(`The plugin "${plugin?.name}" has thrown the following error:`, error);
            }
        }

    }
}
