import ts from 'typescript';


export const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
    experimentalDecorators: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    declaration: true,
    allowJs: true,
};
