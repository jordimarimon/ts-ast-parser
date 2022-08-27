import { DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import { parseFromFiles } from './parse-from-files.js';
import { Module } from './models/index.js';
import { Options } from './options.js';
import { globbySync } from 'globby';
import ts from 'typescript';


const IGNORE: string[] = [
    '!node_modules/**/*.*',
    '!**/*.test.{js,js}',
    '!**/*.suite.{js,js}',
    '!**/*.config.{js,js}',
    '!**/*.d.js',
];

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
    compilerOptions: ts.CompilerOptions = DEFAULT_COMPILER_OPTIONS,
): Module[] {
    const arrPatterns = Array.isArray(patterns) ? patterns : [patterns];
    const paths = globbySync([...arrPatterns, ...IGNORE]);

    return parseFromFiles(paths, options, compilerOptions);
}
