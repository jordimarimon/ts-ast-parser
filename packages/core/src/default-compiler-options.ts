import ts from 'typescript';


/**
 * These are the default TypeScript Compiler options used when we're unable
 * to find TSConfig file in the root of the project.
 */
export const TS_DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
    experimentalDecorators: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    declaration: true,
};

/**
 * These are the default TypeScript Compiler options used when we're analyzing
 * a JavaScript project.
 */
export const JS_DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
    module: ts.ModuleKind.ESNext,
    lib: ['es2020', 'DOM'],
    allowJs: true,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    typeRoots: [],
};
