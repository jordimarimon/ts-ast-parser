import { createCompilerHost } from './compiler-host.js';
import { callPlugins } from './call-plugins.js';
import { Module } from './models/index.js';
import { Context } from './context.js';
import { Options } from './options.js';
import { collect } from './collect.js';
import { clean } from './clean.js';
import { link } from './link.js';
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

    const moduleDoc = collect(fileName, sourceFile);

    link([moduleDoc]);

    clean([moduleDoc]);

    callPlugins([sourceFile], [moduleDoc]);

    return moduleDoc;
}
