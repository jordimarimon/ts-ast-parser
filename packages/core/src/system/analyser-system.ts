import type ts from 'typescript';


/**
 * An abstraction layer around how we interact with
 * the environment (in memory file system or Node.js).
 *
 * All interaction of the TypeScript compiler with the operating system goes
 * through a System interface.
 *
 * You can think of it as the Operating Environment (OE).
 */
export interface AnalyserSystem extends ts.System {
    /**
     * Normalizes the path based on the OS and makes it
     * relative to the current working directory.
     */
    normalizePath(path: string): string;

    /**
     * Returns the absolute path
     */
    getAbsolutePath(path: string): string;

    /**
     * Returns the directory name
     */
    getDirectoryName(path: string): string;

    /**
     * Returns a string with the filename portion of the path
     */
    getBaseName(path: string): string;

    /**
     * Joins the segments using the path separator of the OS/Browser
     */
    join(...segments: string[]): string;

    /**
     * Checks if the path is an absolute path. An absolute
     * path is a path that starts with the ROOT directory.
     *
     * @returns True if the path is absolute
     */
    isAbsolute(path: string): boolean;
}
