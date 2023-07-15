import { JS_DEFAULT_COMPILER_OPTIONS, TS_DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import type { AnalyzerOptions } from './analyzer-options.js';
import ts from 'typescript';
import path from 'path';


export interface ResolvedCompilerOptions {
    compilerOptions: ts.CompilerOptions;
    commandLine: ts.ParsedCommandLine | null;
}

export function getResolvedCompilerOptions(options?: Partial<AnalyzerOptions>): ResolvedCompilerOptions {
    const {compilerOptions, jsProject, tsConfigFilePath} = options ?? {};

    // If it's a JS project, we currently don't allow the user to customize the compiler options
    if (jsProject) {
        return {
            compilerOptions: JS_DEFAULT_COMPILER_OPTIONS,
            commandLine: ts.parseJsonConfigFileContent(
                {
                    compilerOptions: JS_DEFAULT_COMPILER_OPTIONS,
                    include: ['**/*.js'],
                    exclude: ['**node_modules**'],
                },
                ts.sys,
                process.cwd(),
            ),
        };
    }

    // If it's a TS project and the user provides us it's custom compiler options, we will use them
    if (compilerOptions) {
        return {
            compilerOptions: {...compilerOptions, declaration: true},
            commandLine: ts.parseJsonConfigFileContent(
                {
                    compilerOptions: {...compilerOptions, declaration: true},
                    include: ['**/*.ts'],
                    exclude: ['**node_modules**'],
                },
                ts.sys,
                process.cwd(),
            ),
        };
    }

    // If user doesn't provide the compiler options, we will resolve them by
    // searching for a TSConfig file
    const parsedOptions = parseTSConfigFile(tsConfigFilePath);

    if (parsedOptions) {
        return parsedOptions;
    }

    return {
        compilerOptions: TS_DEFAULT_COMPILER_OPTIONS,
        commandLine: ts.parseJsonConfigFileContent(
            {
                compilerOptions: TS_DEFAULT_COMPILER_OPTIONS,
                include: ['**/*.ts'],
                exclude: ['**node_modules**'],
            },
            ts.sys,
            process.cwd(),
        ),
    };
}

function parseTSConfigFile(tsConfigFilePath?: string): ResolvedCompilerOptions | null {
    const fileExists = (filePath: string) => ts.sys.fileExists(filePath);
    const readFile = (filePath: string) => ts.sys.readFile(filePath);
    const basePath = tsConfigFilePath ? path.dirname(path.join(process.cwd(), tsConfigFilePath)) : process.cwd();
    const fileName = tsConfigFilePath ? path.basename(tsConfigFilePath) : 'tsconfig.js';
    const configFileName = ts.findConfigFile(basePath, fileExists, fileName);
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
            commandLine,
            compilerOptions: {...commandLine.options, declaration: true},
        };
    }

    return null;
}
