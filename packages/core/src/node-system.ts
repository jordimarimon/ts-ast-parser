import { JS_DEFAULT_COMPILER_OPTIONS, TS_DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import * as tsvfs from '@typescript/vfs';
import * as path from 'path';
import ts from 'typescript';
import * as fs from 'fs';


export interface NodeSystemOptions {
    analyserOptions: Partial<AnalyserOptions>;
    vfs?: boolean;
}

export class NodeSystem implements AnalyserSystem {

    private readonly _host: ts.CompilerHost;

    private readonly _commandLine: ts.ParsedCommandLine;

    private readonly _sys: ts.System;

    constructor(options: NodeSystemOptions) {
        const {analyserOptions, vfs} = options;

        if (vfs) {
            this._sys = tsvfs.createSystem(new Map<string, string>());
            this._commandLine = this._createCommandLine(analyserOptions);

            // @see https://github.com/microsoft/TypeScript-Website/issues/2801
            // @see https://github.com/microsoft/TypeScript-Website/pull/2802
            // @see https://github.com/microsoft/TypeScript/pull/54011
            const tsLibDirectory = path.dirname(require.resolve('typescript'));
            const libFiles = fs.readdirSync(tsLibDirectory);
            const knownLibFiles = libFiles.filter(f => f.startsWith('lib.') && f.endsWith('.d.ts'));
            knownLibFiles.forEach(name => {
                this._sys.writeFile(`/${name}`, fs.readFileSync(path.join(tsLibDirectory, name), 'utf-8'));
            });

            this._host = tsvfs.createVirtualCompilerHost(this._sys, this._commandLine.options, ts).compilerHost;
        } else {
            this._sys = ts.sys;
            this._commandLine = this._createCommandLine(analyserOptions);
            this._host = ts.createCompilerHost(this._commandLine.options, true);
        }
    }

    getSystem(): ts.System {
        return this._sys;
    }

    getCompilerHost(): ts.CompilerHost {
        return this._host;
    }

    getCommandLine(): ts.ParsedCommandLine {
        return this._commandLine;
    }

    getCurrentDirectory(): string {
        return process.cwd();
    }

    fileExists(filePath: string): boolean {
        return this._host.fileExists(filePath);
    }

    readFile(filePath: string): string {
        return this._host.readFile(filePath) ?? '';
    }

    writeFile(filePath: string, data: string): void {
        this._host.writeFile(filePath, data, false);
    }

    normalizePath(filePath: string | undefined): string {
        return filePath ? path.normalize(path.relative(process.cwd(), filePath)) : '';
    }

    private _createCommandLine(options: Partial<AnalyserOptions>): ts.ParsedCommandLine {
        const {compilerOptions, jsProject, tsConfigFilePath, include, exclude} = options;

        // If it's a JS project, we currently don't allow the user to customize the compiler options
        if (jsProject) {
            return ts.parseJsonConfigFileContent(
                {
                    compilerOptions: JS_DEFAULT_COMPILER_OPTIONS,
                    include: include ?? ['**/*.js'],
                    exclude: exclude ?? ['**node_modules**'],
                },
                this._sys,
                process.cwd(),
            );
        }

        // If it's a TS project and the user provides us it's custom compiler options, we will use them
        if (compilerOptions) {
            return ts.parseJsonConfigFileContent(
                {
                    compilerOptions: {...compilerOptions, declaration: true},
                    include: include ?? ['**/*.ts'],
                    exclude: exclude ?? ['**node_modules**'],
                },
                this._sys,
                process.cwd(),
            );
        }

        // If user doesn't provide the compiler options, we will resolve them by
        // searching for a TSConfig file
        const commandLine = this._parseTSConfigFile(tsConfigFilePath);

        if (commandLine) {
            return commandLine;
        }

        return ts.parseJsonConfigFileContent(
            {
                compilerOptions: TS_DEFAULT_COMPILER_OPTIONS,
                include: include ?? ['**/*.ts'],
                exclude: exclude ?? ['**node_modules**'],
            },
            this._sys,
            process.cwd(),
        );
    }

    private _parseTSConfigFile(tsConfigFilePath?: string): ts.ParsedCommandLine | null {
        const fileExists = (filePath: string) => ts.sys.fileExists(filePath);
        const readFile = (filePath: string) => ts.sys.readFile(filePath);
        const basePath = tsConfigFilePath
            ? path.isAbsolute(tsConfigFilePath)
                ? path.dirname(tsConfigFilePath)
                : path.dirname(path.join(process.cwd(), tsConfigFilePath))
            : process.cwd();
        const fileName = tsConfigFilePath ? path.basename(tsConfigFilePath) : 'tsconfig.json';
        const configFileName = ts.findConfigFile(basePath, fileExists, fileName);
        const configFile = configFileName && ts.readConfigFile(configFileName, readFile);

        if (!configFile || typeof configFile !== 'object') {
            return null;
        }

        return ts.parseJsonConfigFileContent(
            configFile.config,
            this._sys,
            path.dirname(configFileName),
            {},
            configFileName,
        );
    }

}
