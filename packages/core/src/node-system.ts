import { JS_DEFAULT_COMPILER_OPTIONS, TS_DEFAULT_COMPILER_OPTIONS } from './default-compiler-options.js';
import type { AnalyserOptions } from './analyser-options.js';
import type { AnalyserSystem } from './analyser-system.js';
import * as tsvfs from '@typescript/vfs';
import * as path from 'path';
import ts from 'typescript';
import * as fs from 'fs';


/**
 * Options to configure the Node.js system behaviour
 */
export interface NodeSystemOptions {
    /**
     * The analyser options
     */
    analyserOptions: Partial<AnalyserOptions>;

    /**
     * If, true, an in-memory file system will be used
     */
    vfs: boolean;

    /**
     * The initial files to add in the in-memory file system
     */
    fsMap: Map<string, string>;
}

/**
 * Abstraction layer to use the analyser with Node.js
 */
export class NodeSystem implements AnalyserSystem {

    private _commandLine: ts.ParsedCommandLine;

    private readonly _host: ts.CompilerHost;

    private readonly _sys: ts.System;

    private readonly _options: Partial<NodeSystemOptions> = {};

    private readonly _updateFile: ((sourceFile: ts.SourceFile) => void) | null = null;

    constructor(options: Partial<NodeSystemOptions> = {}) {
        this._options = options;

        if (options.vfs) {
            this._sys = tsvfs.createSystem(options.fsMap ?? new Map<string, string>());
            this._commandLine = this._createCommandLine();

            // @see https://github.com/microsoft/TypeScript-Website/issues/2801
            // @see https://github.com/microsoft/TypeScript-Website/pull/2802
            // @see https://github.com/microsoft/TypeScript/pull/54011
            const tsLibDirectory = path.dirname(require.resolve('typescript'));
            const libFiles = fs.readdirSync(tsLibDirectory);
            const knownLibFiles = libFiles.filter(f => f.startsWith('lib.') && f.endsWith('.d.ts'));
            knownLibFiles.forEach(name => {
                this._sys.writeFile(`/${name}`, fs.readFileSync(path.join(tsLibDirectory, name), 'utf-8'));
            });

            const virtualCompilerHost = tsvfs.createVirtualCompilerHost(this._sys, this._commandLine.options, ts);
            this._host = virtualCompilerHost.compilerHost;
            this._updateFile = virtualCompilerHost.updateFile;
        } else {
            this._sys = ts.sys;
            this._commandLine = this._createCommandLine();
            this._host = ts.createCompilerHost(this._commandLine.options, true);
        }
    }

    /**
     * All interaction of the TypeScript compiler with the operating system goes
     * through a System interface.
     *
     * You can think of it as the Operating Environment (OE).
     */
    getSystem(): ts.System {
        return this._sys;
    }

    /**
     * This is used by the Program to interact with the System.
     */
    getCompilerHost(): ts.CompilerHost {
        return this._host;
    }

    /**
     * The parsed compiler options
     */
    getCommandLine(): ts.ParsedCommandLine {
        return this._commandLine;
    }

    /**
     * The current working directory
     */
    getCurrentDirectory(): string {
        return this._host.getCurrentDirectory();
    }

    /**
     * Checks whether the file exists
     *
     * @returns True if the file exists, otherwise false
     */
    fileExists(filePath: string): boolean {
        return this._host.fileExists(filePath);
    }

    /**
     * Reads the data encoded inside a file
     */
    readFile(filePath: string): string {
        return this._host.readFile(filePath) ?? '';
    }

    /**
     * Writes the provided data to the file.
     *
     * Be careful! As of right now, it will write to disk
     * when working with a real file system
     */
    writeFile(filePath: string, data: string): void {
        const fileExists = this._host.fileExists(filePath);

        if (this._options.vfs && fileExists) {
            const target = this._commandLine.options.target ?? ts.ScriptTarget.ES2022;
            const oldSourceFile = this._host.getSourceFile(filePath, target) as ts.SourceFile;
            const textRangeChange: ts.TextChangeRange = {
                span: {start: 0, length: oldSourceFile.text.length},
                newLength: data.length,
            };
            const newSourceFile = oldSourceFile.update(data, textRangeChange);
            this._updateFile?.(newSourceFile);
        } else {
            this._host.writeFile(filePath, data, false);
        }

        if (!fileExists) {
            this._commandLine = this._createCommandLine();
        }
    }

    /**
     * Normalizes the path based on the OS and makes it
     * relative to the current working directory.
     */
    normalizePath(filePath: string | undefined): string {
        return filePath ? path.normalize(path.relative(this.getCurrentDirectory(), filePath)) : '';
    }

    /**
     * Returns the absolute path
     */
    getAbsolutePath(filePath: string | undefined): string {
        if (!filePath) {
            return '';
        }

        if (path.isAbsolute(filePath)) {
            return filePath;
        }

        return this._options.vfs ? path.join(this.getCurrentDirectory(), filePath) : path.resolve(filePath);
    }

    /**
     * Returns the directory name
     */
    getDirName(filePath: string): string {
        return path.dirname(filePath);
    }

    /**
     * Joins the segments using the path separator of the OS/Browser
     */
    join(...segments: string[]): string {
        return path.join(...segments);
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    private _createCommandLine(): ts.ParsedCommandLine {
        const {analyserOptions = {}, vfs} = this._options;
        const {compilerOptions, jsProject, include, exclude} = analyserOptions;
        const defaultExclude = ['**node_modules**'];
        const basePath = vfs ? '/' : process.cwd();

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
        const commandLine = this._parseTSConfigFile();

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

    private _parseTSConfigFile(): ts.ParsedCommandLine | null {
        const {analyserOptions = {}, vfs} = this._options;
        const {tsConfigFilePath, include, exclude} = analyserOptions;
        const fileExists = (filePath: string): boolean => ts.sys.fileExists(filePath);
        const readFile = (filePath: string): string | undefined => ts.sys.readFile(filePath);
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
            vfs ? '/' : path.dirname(configFileName),
            {},
            vfs ? undefined : configFileName,
        );
    }
}
