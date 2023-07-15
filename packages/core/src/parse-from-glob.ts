import type { AnalyzerOptions } from './analyzer-options.js';
import type { ModuleNode } from './nodes/module-node.js';
import { parseFromFiles } from './parse-from-files.js';
import { globbySync } from 'globby';


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
 * @param options - Options to configure the analyzer
 *
 * @returns The reflected TypeScript AST
 */
export function parseFromGlob(patterns: string | string[], options?: Partial<AnalyzerOptions>): ModuleNode[] {
    const arrPatterns = Array.isArray(patterns) ? patterns : [patterns];
    const paths = globbySync([...arrPatterns, ...IGNORE]);

    return parseFromFiles(paths, options);
}
