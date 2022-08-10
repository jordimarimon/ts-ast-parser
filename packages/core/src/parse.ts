import { createCompilerHost } from './compiler-host.js';
import { collect } from './collect/index.js';
import { logError } from './utils/index.js';
import { Module } from './models/index.js';
import { Options } from './options.js';
import { Context } from './context.js';
import { globbySync } from 'globby';
import * as path from 'path';
import ts from 'typescript';


const IGNORE: string[] = [
    '!node_modules/**/*.*',
    '!**/*.test.{js,ts}',
    '!**/*.suite.{js,ts}',
    '!**/*.config.{js,ts}',
    '!**/*.d.ts',
];

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

    const moduleDoc = collect(fileName, sourceFile);

    callPlugins([sourceFile], [moduleDoc]);

    return moduleDoc;
}

/**
 * Given some [glob](https://en.wikipedia.org/wiki/Glob_(programming))
 * patterns and some configurable options, extracts metadata from the
 * TypeScript Abstract Syntax Tree.
 *
 * Internally [globby](https://github.com/sindresorhus/globby) handles the pattern matching.
 * Any pattern that `globby` accepts can be used.
 *
 * @param patterns - A string or an array of strings that represent glob patterns
 * @param options - Options that can be used to configure the output metadata
 * @param compilerOptions - Options to pass to the TypeScript compiler
 *
 * @returns The metadata of each TypeScript file
 */
export function parseFromGlob(
    patterns: string | string[] = ['**/*.{ts,tsx}'],
    options: Partial<Options> = {},
    compilerOptions: ts.CompilerOptions = {},
): Module[] {
    const arrPatterns = Array.isArray(patterns) ? patterns : [patterns];
    const paths = globbySync([...arrPatterns, ...IGNORE]);

    return parseFromFiles(paths, options, compilerOptions);
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