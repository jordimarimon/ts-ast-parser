import { DEFAULT_GLOBBY_EXCLUDE } from './default-compiler-options.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserResult } from './analyser-result.js';
import { parseFromFiles } from './parse-from-files.js';
import { globbySync } from 'globby';

/**
 * Given some [glob]{@link https://en.wikipedia.org/wiki/Glob_(programming)}
 * patterns and some configurable options, reflects a simplified version
 * of the TypeScript Abstract Syntax Tree.
 *
 * Internally [globby]{@link https://github.com/sindresorhus/globby} handles the pattern matching.
 * Any pattern that `globby` accepts can be used.
 *
 * @param patterns - A string or an array of strings that represent glob patterns
 * @param options - Options to configure the analyzer
 * @returns The reflected TypeScript AST
 */
export function parseFromGlob(
    patterns: string | string[],
    options: Partial<AnalyserOptions> = {},
): Promise<AnalyserResult> {
    const arrPatterns = Array.isArray(patterns) ? patterns : [patterns];
    const paths = globbySync([...arrPatterns, ...DEFAULT_GLOBBY_EXCLUDE]);

    return parseFromFiles(paths, options);
}
