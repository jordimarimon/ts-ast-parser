import { DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import { createCompilerHost } from './compiler-host.js';
import { Module } from './models/index.js';
import { Context } from './context.js';
import { collect } from './collect.js';
import { clean } from './clean.js';
import ts from 'typescript';


/**
 * Extracts the metadata from a TypeScript code snippet
 *
 * @param source - A string that represents the TypeScript source code
 * @param compilerOptions - Options to pass to the TypeScript compiler
 *
 * @returns The metadata extracted from the source code provided
 */
export function parseFromSource(source: string, compilerOptions?: ts.CompilerOptions): Module {
    const fileName = 'unknown.ts';
    const compilerHost = createCompilerHost(fileName, source);
    const resolvedCompilerOptions = compilerOptions ?? DEFAULT_COMPILER_OPTIONS;
    const program = ts.createProgram([fileName], resolvedCompilerOptions, compilerHost);
    const sourceFile = program.getSourceFile(fileName);

    Context.checker = program.getTypeChecker();
    Context.compilerOptions = resolvedCompilerOptions;

    const moduleDoc = collect(sourceFile);

    clean([moduleDoc]);

    return moduleDoc;
}
