/**
 * These are the default globs used to exclude files when using
 * the `parseFromGlob` function.
 *
 * @see {@link https://github.com/sindresorhus/globby | globby}
 */
export const DEFAULT_GLOBBY_EXCLUDE: string[] = [
    '!node_modules/**/*.*',
    '!**/*.test.{ts,js}',
    '!**/*.spec.{ts,js}',
    '!**/*.suite.{ts,js}',
    '!**/*.config.{ts,js}',
    '!**/*.d.ts',
];

/**
 * These are the default TypeScript Compiler options used when we're unable
 * to find TSConfig file in the root of the project.
 *
 * @see {@link https://www.typescriptlang.org/tsconfig#compilerOptions | CompilerOptions}
 */
export const TS_DEFAULT_COMPILER_OPTIONS = {
    experimentalDecorators: true,
    target: 'es2020',
    module: 'ES2020',
    lib: ['es2020', 'DOM'],
    declaration: true,
    suppressOutputPathCheck: true,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
};

/**
 * These are the default TypeScript Compiler options used when we're analyzing
 * a JavaScript project.
 *
 * @see {@link https://www.typescriptlang.org/tsconfig#compilerOptions | CompilerOptions}
 */
export const JS_DEFAULT_COMPILER_OPTIONS = {
    target: 'es2020',
    module: 'ES2020',
    lib: ['es2020', 'DOM'],
    allowJs: true,
    suppressOutputPathCheck: true,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    moduleResolution: 'node',
    typeRoots: [],
};
