import type { AnalyserSystem } from './analyser-system.js';
import * as path from 'path';
import ts from 'typescript';
import * as fs from 'fs';


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
     */
    write(content: string): void {
        ts.sys.write(content);
    }

    /**
     * Reads the data encoded inside a file
     */
    readFile(filePath: string, encoding?: string): string {
        return ts.sys.readFile(filePath, encoding) ?? '';
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
     * @param path - The path from where to search
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
     */
    normalizePath(filePath: string): string {
        return path.normalize(path.relative(this.getCurrentDirectory(), filePath));
    }

    /**
     * Returns the directory name
     */
    getDirectoryName(filePath: string): string {
        return path.dirname(filePath);
    }

    /**
     * Returns a string with the filename portion of the path
     */
    getBaseName(filePath: string): string {
        return path.basename(filePath);
    }

    /**
     * Joins the segments using the path separator of the OS/Browser
     */
    join(...segments: string[]): string {
        return path.join(...segments);
    }

    /**
     * Checks if the path is an absolute path. An absolute
     * path is a path that starts with the ROOT directory.
     *
     * @returns True if the path is absolute
     */
    isAbsolute(filePath: string): boolean {
        return path.isAbsolute(filePath);
    }

    /**
     * Returns the absolute path
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
}
