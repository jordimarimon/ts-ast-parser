import type ts from 'typescript';


/**
 * An abstraction layer around how we interact with the environment (browser or Node.js)
 */
export interface AnalyserSystem {
    /**
     * All interaction of the TypeScript compiler with the operating system goes
     * through a System interface.
     *
     * You can think of it as the Operating Environment (OE).
     */
    getSystem(): ts.System;

    /**
     * This is used by the Program to interact with the System.
     */
    getCompilerHost(): ts.CompilerHost;

    /**
     * Returns the parsed compiler options
     */
    getCommandLine(): ts.ParsedCommandLine;

    /**
     * Returns the current working directory
     */
    getCurrentDirectory(): string;

    /**
     * Checks whether the file exists
     */
    fileExists(path: string): boolean;

    /**
     * Reads the data encoded inside a file
     */
    readFile(path: string): string;

    /**
     * Writes the provided data to the file.
     */
    writeFile(path: string, data: string): void;

    /**
     * Normalizes the path based on the OS and makes it
     * relative to the current working directory.
     */
    normalizePath(path: string | undefined): string;

    /**
     * Returns the absolute path
     */
    getAbsolutePath(path: string | undefined): string;
}
