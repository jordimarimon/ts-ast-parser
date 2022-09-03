import ts from 'typescript';
import path from 'path';


export const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
    experimentalDecorators: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
};

export function getResolvedCompilerOptions(compilerOptions?: ts.CompilerOptions): ts.CompilerOptions {
    let resolvedCompilerOptions = compilerOptions;

    if (!resolvedCompilerOptions) {
        const fileExists = (filePath: string) => ts.sys.fileExists(filePath);
        const readFile = (filePath: string) => ts.sys.readFile(filePath);
        const configFileName = ts.findConfigFile(process.cwd(), fileExists, 'tsconfig.json');
        const configFile = configFileName && ts.readConfigFile(configFileName, readFile);

        if (configFile && typeof configFile === 'object') {
            const commandLine = ts.parseJsonConfigFileContent(
                configFile.config,
                ts.sys,
                process.cwd(),
                undefined,
                path.relative(process.cwd(), configFileName),
            );

            resolvedCompilerOptions = commandLine.options;
        } else {
            resolvedCompilerOptions = DEFAULT_COMPILER_OPTIONS;
        }
    }

    return resolvedCompilerOptions;
}
