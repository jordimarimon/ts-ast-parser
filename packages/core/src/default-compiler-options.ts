import ts from 'typescript';


/**
 * These are the default TypeScript Compiler options used when we're unable
 * to find the `tsconfig.json` in the root of the project.
 */
export const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
    experimentalDecorators: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    declaration: true,
    allowJs: true,
};
