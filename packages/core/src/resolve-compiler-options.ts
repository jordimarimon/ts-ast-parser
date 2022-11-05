import { DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import ts from 'typescript';
import path from 'path';


export function getResolvedCompilerOptions(compilerOptions?: ts.CompilerOptions): ts.CompilerOptions {
    if (!compilerOptions) {
        return getTsConfigOptions() ?? DEFAULT_COMPILER_OPTIONS;
    }

    return compilerOptions;
}

function getTsConfigOptions(): ts.CompilerOptions | null {
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

        return {
            ...commandLine.options,
            declaration: true,
        };
    }

    return null;
}
