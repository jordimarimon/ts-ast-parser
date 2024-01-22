import type { AnalyserSystem } from './analyser-system.js';
import { isBrowser } from './is-browser.js';
import ts from 'typescript';


/**
 * This is used by the TypeScript Program to interact
 * with the System Interface.
 */
export class CompilerHost implements ts.CompilerHost {

    private readonly _system: AnalyserSystem;

    private readonly _options: ts.CompilerOptions;

    private readonly _cwd: string;

    constructor(system: AnalyserSystem, options: ts.CompilerOptions) {
        this._system = system;
        this._options = options;
        this._cwd = system.getCurrentDirectory();
    }

    getSourceFile(fileName: string, options: ts.ScriptTarget | ts.CreateSourceFileOptions): ts.SourceFile {
        const text = this.readFile(fileName, this._options.charset);
        return ts.createSourceFile(fileName, text, options, true);
    }

    getDefaultLibFileName(options: ts.CompilerOptions): string {
        return isBrowser ? ts.getDefaultLibFileName(options) : ts.getDefaultLibFilePath(options);
    }

    writeFile(fileName: string, text: string, writeByteOrderMark: boolean): void {
        this._system.writeFile(fileName, text, writeByteOrderMark);
    }

    getCurrentDirectory(): string {
        return this._cwd;
    }

    useCaseSensitiveFileNames(): boolean {
        return this._system.useCaseSensitiveFileNames;
    }

    getCanonicalFileName(fileName: string): string {
        return this._system.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
    }

    getNewLine(): string {
        return this._system.newLine;
    }

    fileExists(fileName: string): boolean {
        return this._system.fileExists(fileName);
    }

    readFile(fileName: string, encoding?: string): string {
        return this._system.readFile(fileName, encoding) ?? '';
    }

    directoryExists(directoryName: string): boolean {
        return this._system.directoryExists(directoryName);
    }

    getDirectories(filePath: string): string[] {
        return this._system.getDirectories(filePath);
    }

    readDirectory(
        rootDir: string,
        extensions: readonly string[],
        excludes: readonly string[] | undefined,
        includes: readonly string[],
        depth?: number,
    ): string[] {
        return this._system.readDirectory(rootDir, extensions, excludes, includes, depth);
    }

    realpath(filePath: string): string {
        return this._system.realpath(filePath);
    }
}
