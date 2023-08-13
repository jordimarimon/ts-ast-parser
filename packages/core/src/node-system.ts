import { JS_DEFAULT_COMPILER_OPTIONS, TS_DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import * as tsvfs from '@typescript/vfs';
import * as path from 'path';
import ts from 'typescript';
import * as fs from 'fs';

/**
 * Options to configure the system behaviour
 */
export interface NodeSystemOptions {
    /**
     * The original analyser options
     */
    analyserOptions: Partial<AnalyserOptions>;

    /**
     * If, true, an in-memory file system will be used
     */
    vfs?: boolean;

    /**
     * The initial files to add in the in-memory file system
     */
    fsMap?: Map<string, string>;
}

/**
 * Abstraction layer to use the analyser with Node.js
 */
export class NodeSystem implements AnalyserSystem {
    private readonly _host: ts.CompilerHost;

    private readonly _commandLine: ts.ParsedCommandLine;

    private readonly _sys: ts.System;

    constructor(options: NodeSystemOptions) {
        const { analyserOptions, vfs, fsMap } = options;

        if (vfs) {
            this._sys = tsvfs.createSystem(fsMap ?? new Map<string, string>());
            this._commandLine = this._createCommandLine(analyserOptions, options);

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
            this._commandLine = this._createCommandLine(analyserOptions, options);
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
        return this._host.getCurrentDirectory();
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
        return filePath ? path.normalize(path.relative(this.getCurrentDirectory(), filePath)) : '';
    }

    getAbsolutePath(filePath: string | undefined): string {
        return filePath ? (path.isAbsolute(filePath) ? filePath : path.resolve(filePath)) : '';
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    private _createCommandLine(options: Partial<AnalyserOptions>, systemOpts: NodeSystemOptions): ts.ParsedCommandLine {
        const { compilerOptions, jsProject, include, exclude } = options;
        const defaultExclude = ['**node_modules**'];
        const basePath = systemOpts.vfs ? '/' : process.cwd();

        // If it's a JS project, we currently don't allow the user to
        // customize the compiler options
        if (jsProject) {
            return ts.parseJsonConfigFileContent(
                {
                    compilerOptions: JS_DEFAULT_COMPILER_OPTIONS,
                    include: include ?? ['**/*.js'],
                    exclude: exclude ?? defaultExclude,
                },
                this._sys,
                basePath,
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
                this._sys,
                basePath,
            );
        }

        // If user doesn't provide the compiler options, we will resolve them by
        // searching for a TSConfig file
        const commandLine = this._parseTSConfigFile(options, systemOpts);

        if (commandLine) {
            return commandLine;
        }

        return ts.parseJsonConfigFileContent(
            {
                compilerOptions: TS_DEFAULT_COMPILER_OPTIONS,
                include: include ?? ['**/*.ts'],
                exclude: exclude ?? defaultExclude,
            },
            this._sys,
            basePath,
        );
    }

    private _parseTSConfigFile(
        options: Partial<AnalyserOptions>,
        systemOpts: NodeSystemOptions,
    ): ts.ParsedCommandLine | null {
        const { tsConfigFilePath, include, exclude } = options;
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
            this._sys,
            systemOpts.vfs ? '/' : path.dirname(configFileName),
            {},
            systemOpts.vfs ? undefined : configFileName,
        );
    }
}
