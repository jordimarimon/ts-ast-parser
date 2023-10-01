import { JS_DEFAULT_COMPILER_OPTIONS, TS_DEFAULT_COMPILER_OPTIONS } from '../default-compiler-options.js';
import type { AnalyserOptions } from '../analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import ts from 'typescript';


export function createCommandLine(system: AnalyserSystem, options: Partial<AnalyserOptions>): ts.ParsedCommandLine {
    const {compilerOptions, jsProject, include, exclude} = options;
    const defaultExclude = ['**node_modules**'];

    // If it's a JS project, we currently don't allow the user to
    // customize the compiler options
    if (jsProject) {
        return ts.parseJsonConfigFileContent(
            {
                compilerOptions: JS_DEFAULT_COMPILER_OPTIONS,
                include: include ?? ['**/*.js'],
                exclude: exclude ?? defaultExclude,
            },
            system,
            system.getCurrentDirectory(),
        );
    }

    // If it's a TS project and the user provides us it's custom
    // compiler options, we will use them
    if (compilerOptions) {
        return ts.parseJsonConfigFileContent(
            {
                compilerOptions: { ...compilerOptions, declaration: true },
                include: include ?? ['**/*.ts'],
                exclude: exclude ?? defaultExclude,
            },
            system,
            system.getCurrentDirectory(),
        );
    }

    // If user doesn't provide the compiler options, we will resolve them by
    // searching for a TSConfig file
    const commandLine = parseTSConfigFile(system, options);

    if (commandLine) {
        return commandLine;
    }

    return ts.parseJsonConfigFileContent(
        {
            compilerOptions: TS_DEFAULT_COMPILER_OPTIONS,
            include: include ?? ['**/*.ts'],
            exclude: exclude ?? defaultExclude,
        },
        system,
        system.getCurrentDirectory(),
    );
}

function parseTSConfigFile(system: AnalyserSystem, options: Partial<AnalyserOptions>): ts.ParsedCommandLine | null {
    const {tsConfigFilePath, include, exclude} = options;
    const fileExists = (filePath: string): boolean => system.fileExists(filePath);
    const readFile = (filePath: string): string | undefined => system.readFile(filePath);
    const basePath = tsConfigFilePath
        ? system.isAbsolute(tsConfigFilePath)
            ? system.getDirectoryName(tsConfigFilePath)
            : system.getDirectoryName(system.getAbsolutePath(tsConfigFilePath))
        : system.getCurrentDirectory();
    const fileName = tsConfigFilePath ? system.getBaseName(tsConfigFilePath) : 'tsconfig.json';
    const configFileName = ts.findConfigFile(basePath, fileExists, fileName);
    const configFile = configFileName && ts.readConfigFile(configFileName, readFile);

    if (!configFile || typeof configFile !== 'object') {
        return null;
    }

    if (exclude !== undefined && Array.isArray(exclude)) {
        configFile.config.exclude ??= [];
        configFile.config.exclude.push(...exclude);
    }

    if (include !== undefined && Array.isArray(include)) {
        configFile.config.include ??= [];
        configFile.config.include.push(...include);
    }

    return ts.parseJsonConfigFileContent(
        configFile.config,
        system,
        system.getDirectoryName(configFileName),
        {},
        configFileName,
    );
}
