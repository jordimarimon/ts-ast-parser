import type { AnalyserSystem } from './analyser-system.js';
import { platform } from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import ts from 'typescript';


/**
 * System interface to interact with the OS in a Node.js environment.
 *
 * All interaction of the TypeScript compiler with the operating system goes
 * through a System interface.
 *
 * You can think of it as the Operating Environment (OE).
 */
export class NodeSystem implements AnalyserSystem {

    get args(): string[] {
        return ts.sys.args;
    }

    get newLine(): string {
        return ts.sys.newLine;
    }

    get useCaseSensitiveFileNames(): boolean {
        return ts.sys.useCaseSensitiveFileNames;
    }

    /**
     * Writes the content
     *
     * @param content - Content to write to the file
     */
    write(content: string): void {
        ts.sys.write(content);
    }

    /**
     * Reads the data encoded inside a file
     *
     * @param filePath - The file path
     * @param encoding - The file econding
     *
     * @returns The content of the file
     */
    readFile(filePath: string, encoding?: string): string {
        const absolutePath = this.getAbsolutePath(filePath);
        return ts.sys.readFile(absolutePath, encoding) ?? '';
    }

    writeFile(filePath: string, data: string): void {
        const absolutePath = this.getAbsolutePath(filePath);
        this._ensureDirectoryExistence(absolutePath);
        ts.sys.writeFile(absolutePath, data);
    }

    resolvePath(filePath: string): string {
        return ts.sys.resolvePath(filePath);
    }

    /**
     * Checks whether the file exists
     *
     * @param filePath
     * @returns True if the file exists, otherwise false
     */
    fileExists(filePath: string): boolean {
        const absolutePath = this.getAbsolutePath(filePath);
        return ts.sys.fileExists(absolutePath);
    }

    directoryExists(filePath: string): boolean {
        const absolutePath = this.getAbsolutePath(filePath);
        return ts.sys.directoryExists(absolutePath);
    }

    createDirectory(filePath: string): void {
        const absolutePath = this.getAbsolutePath(filePath);
        this._ensureDirectoryExistence(absolutePath);
        ts.sys.createDirectory(absolutePath);
    }

    getExecutingFilePath(): string {
        return ts.sys.getExecutingFilePath();
    }

    /**
     * The current working directory
     */
    getCurrentDirectory(): string {
        return ts.sys.getCurrentDirectory();
    }

    /**
     * Returns the directory names (not the absolute path)
     *
     * @param filePath - The path from where to search
     */
    getDirectories(filePath: string): string[] {
        const absolutePath = this.getAbsolutePath(filePath);
        return ts.sys.getDirectories(absolutePath);
    }

    readDirectory(
        filePath: string,
        extensions?: readonly string[],
        exclude?: readonly string[],
        include?: readonly string[],
        depth?: number,
    ): string[] {
        const absolutePath = this.getAbsolutePath(filePath);
        return ts.sys.readDirectory(absolutePath, extensions, exclude, include, depth);
    }

    exit(exitCode?: number): void {
        ts.sys.exit(exitCode);
    }

    /**
     * Normalizes the path based on the OS and makes it
     * relative to the current working directory.
     *
     * @param filePath
     */
    normalizePath(filePath: string): string {
        return path.normalize(path.relative(this.getCurrentDirectory(), filePath));
    }

    /**
     * Returns the directory name
     *
     * @param filePath
     */
    getDirectoryName(filePath: string): string {
        return path.dirname(filePath);
    }

    /**
     * Returns a string with the filename portion of the path
     *
     * @param filePath
     */
    getBaseName(filePath: string): string {
        return path.basename(filePath);
    }

    /**
     * Joins the segments using the path separator of the OS/Browser
     *
     * @param segments
     */
    join(...segments: string[]): string {
        return path.join(...segments);
    }

    /**
     * Checks if the path is an absolute path. An absolute
     * path is a path that starts with the ROOT directory.
     *
     * @param filePath
     * @returns True if the path is absolute
     */
    isAbsolute(filePath: string): boolean {
        return path.isAbsolute(filePath);
    }

    /**
     * Resolves symlinks to get the real path
     *
     * @param filePath
     */
    realpath(filePath: string): string {
        return fs.realpathSync.native
            ? platform === 'win32'
                ? this.fsRealPathHandlingLongPath(filePath)
                : fs.realpathSync.native(filePath)
            : fs.realpathSync(filePath);
    }

    /**
     * Returns the absolute path
     *
     * @param filePath
     */
    getAbsolutePath(filePath: string): string {
        if (this.isAbsolute(filePath)) {
            return filePath;
        }

        return path.resolve(filePath);
    }

    private _ensureDirectoryExistence(filePath: string): void {
        const dirname = path.dirname(filePath);

        if (fs.existsSync(dirname)) {
            return;
        }

        this._ensureDirectoryExistence(dirname);

        fs.mkdirSync(dirname);
    }

    private fsRealPathHandlingLongPath(filePath: string): string {
        return filePath.length < 260 ? fs.realpathSync.native(filePath) : fs.realpathSync(filePath);
    }
}
