import { getResolvedCompilerOptions } from './compiler-options.js';
import { formatDiagnostics, logError } from './utils/index.js';
import { callPlugins } from './call-plugins.js';
import { Module } from './models/index.js';
import { Options } from './options.js';
import { Context } from './context.js';
import { collect } from './collect.js';
import { clean } from './clean.js';
import * as path from 'path';
import ts from 'typescript';


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
    compilerOptions?: ts.CompilerOptions,
): Module[] {
    const modules: Module[] = [];
    const sourceFiles: (ts.SourceFile | undefined)[] = [];
    const resolvedCompilerOptions = getResolvedCompilerOptions(compilerOptions);
    const program = ts.createProgram(files, resolvedCompilerOptions);
    const diagnostics = program.getSemanticDiagnostics();

    if (diagnostics.length) {
        logError('Error analysing source files:', formatDiagnostics(diagnostics));
        return [];
    }

    Context.options = options;
    Context.checker = program.getTypeChecker();
    Context.compilerOptions = resolvedCompilerOptions;
    Context.normalizePath = filePath => filePath ? path.normalize(path.relative(process.cwd(), filePath)) : '';

    for (const file of files) {
        const sourceFile = program.getSourceFile(file);
        const moduleDoc = collect(sourceFile);

        sourceFiles.push(sourceFile);
        modules.push(moduleDoc);
    }

    clean(modules);

    callPlugins(sourceFiles, modules);

    return modules;
}
