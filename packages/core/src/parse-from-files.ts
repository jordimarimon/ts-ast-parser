import { getResolvedCompilerOptions } from './resolve-compiler-options.js';
import { formatDiagnostics, logError } from './utils/index.js';
import { Module } from './models/index.js';
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
 * @param compilerOptions - Options to pass to the TypeScript compiler
 *
 * @returns The metadata of each TypeScript file
 */
export function parseFromFiles(files: readonly string[], compilerOptions?: ts.CompilerOptions): Module[] {
    const modules: Module[] = [];
    const resolvedCompilerOptions = getResolvedCompilerOptions(compilerOptions);
    const program = ts.createProgram(files, resolvedCompilerOptions);
    const diagnostics = program.getSemanticDiagnostics();

    if (diagnostics.length) {
        logError('Error analysing source files:', formatDiagnostics(diagnostics));
        return [];
    }

    Context.checker = program.getTypeChecker();
    Context.compilerOptions = resolvedCompilerOptions;
    Context.normalizePath = filePath => filePath ? path.normalize(path.relative(process.cwd(), filePath)) : '';

    for (const file of files) {
        const sourceFile = program.getSourceFile(file);
        const moduleDoc = collect(sourceFile);

        modules.push(moduleDoc);
    }

    clean(modules);

    return modules;
}
