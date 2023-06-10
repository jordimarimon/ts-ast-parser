import { parseFromFiles } from './parse-from-files.js';
import type { ModuleNode } from './nodes/module-node.js';
import { globbySync } from 'globby';
import type ts from 'typescript';


const IGNORE: string[] = [
    '!node_modules/**/*.*',
    '!**/*.test.{ts,js}',
    '!**/*.suite.{ts,js}',
    '!**/*.config.{ts,js}',
    '!**/*.d.ts',
];

/**
 * Given some [glob](https://en.wikipedia.org/wiki/Glob_(programming))
 * patterns and some configurable options, reflects a simplified version
 * of the TypeScript Abstract Syntax Tree.
 *
 * Internally [globby](https://github.com/sindresorhus/globby) handles the pattern matching.
 * Any pattern that `globby` accepts can be used.
 *
 * @param patterns - A string or an array of strings that represent glob patterns
 * @param compilerOptions - Options to pass to the TypeScript compiler
 *
 * @returns The reflected TypeScript AST
 */
export function parseFromGlob(patterns: string | string[], compilerOptions?: ts.CompilerOptions): ModuleNode[] {
    const arrPatterns = Array.isArray(patterns) ? patterns : [patterns];
    const paths = globbySync([...arrPatterns, ...IGNORE]);

    return parseFromFiles(paths, compilerOptions);
}
