import ts from 'typescript';


export const DEFAULT_GLOBBY_EXCLUDE: string[] = [
    '!node_modules/**/*.*',
    '!**/*.test.{ts,js}',
    '!**/*.suite.{ts,js}',
    '!**/*.config.{ts,js}',
    '!**/*.d.ts',
];

/**
 * These are the default TypeScript Compiler options used when we're unable
 * to find TSConfig file in the root of the project.
 */
export const TS_DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
    experimentalDecorators: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    lib: ['es2020', 'DOM'],
    declaration: true,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    suppressOutputPathCheck: true,
};

/**
 * These are the default TypeScript Compiler options used when we're analyzing
 * a JavaScript project.
 */
export const JS_DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    lib: ['es2020', 'DOM'],
    allowJs: true,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    typeRoots: [],
};
