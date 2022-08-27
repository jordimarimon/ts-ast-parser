import ts from 'typescript';


// FIXME(Jordi M.): Maybe it will be better to read the tsconfig.json
//  from the project root directory and use it as the default options
export const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
    experimentalDecorators: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
};
