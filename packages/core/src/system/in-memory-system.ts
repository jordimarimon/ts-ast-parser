import type { AnalyserSystem } from './analyser-system.js';
import { knownLibFiles } from './known-lib-files.js';
import { isBrowser } from './is-browser.js';
import ts from 'typescript';


// The root directory of the in memory file system
const ROOT_DIR = 'root';

// The separator used in the in memory file system
const SEP = '/';

enum FSNodeType {
    File,
    Directory,
}

interface FSFileNode {
    type: FSNodeType.File;
    name: string;
    data: string;
    parent: FSDirectoryNode;
}

interface FSDirectoryNode {
    type: FSNodeType.Directory;
    name: string;
    children: FSNode[];
    parent: FSNode | null;
}

type FSNode = FSFileNode | FSDirectoryNode;

/**
 * System interface to interact with an in memory file system.
 *
 * All interaction of the TypeScript compiler with the operating system goes
 * through a System interface.
 *
 * This is a very simplistic approach. For complex use cases,
 * this may not be enough.
 */
export class InMemorySystem implements AnalyserSystem {

    readonly newLine = '\n';

    readonly useCaseSensitiveFileNames = false;

    readonly args: string[] = [];

    private readonly _fs: FSDirectoryNode = {
        type: FSNodeType.Directory,
        name: ROOT_DIR,
        children: [],
        parent: null,
    };

    private constructor(files?: Map<string, string>) {
        const entries = files?.entries() ?? [];

        for (const [name, data] of entries) {
            this.writeFile(name, data);
        }
    }

    static async create(files?: Map<string, string>): Promise<InMemorySystem> {
        const system = new InMemorySystem(files);

        if (isBrowser) {
            await system._writeLibFilesFromCDN(ts.version);
        } else {
            await system._writeLibFilesFromNodeModules();
        }

        return system;
    }

    /**
     * This method is not implemented and calling it, will throw
     * an exception
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    write(_content: string): void {
        throw new Error('Method \'write\' is not supported.');
    }

    /**
     * Reads the data encoded inside a file
     */
    readFile(path: string): string | undefined {
        const absolutePath = this.getAbsolutePath(path);

        const node = this._get(absolutePath);
        if (node?.type === FSNodeType.File) {
            return node.data;
        }

        return undefined;
    }

    writeFile(path: string, data: string): void {
        const absolutePath = this.getAbsolutePath(path);
        this._setFile(absolutePath, data);
    }

    resolvePath(path: string): string {
        return this.getAbsolutePath(path);
    }

    /**
     * Checks whether the file exists
     *
     * @returns True if the file exists, otherwise false
     */
    fileExists(path: string): boolean {
        const absolutePath = this.getAbsolutePath(path);
        const node = this._get(absolutePath);

        return node?.type === FSNodeType.File;
    }

    directoryExists(path: string): boolean {
        const absolutePath = this.getAbsolutePath(path);
        const node = this._get(absolutePath);

        return node?.type === FSNodeType.Directory;
    }

    createDirectory(path: string): void {
        const absolutePath = this.getAbsolutePath(path);
        this._setDirectory(absolutePath);
    }

    /**
     * This method is not implemented and calling it, will throw
     * an exception
     */
    getExecutingFilePath(): string {
        throw new Error('Method \'getExecutingFilePath\' is not supported.');
    }

    /**
     * The root directory name
     */
    getCurrentDirectory(): string {
        return ROOT_DIR;
    }

    /**
     * Returns the directory names (not the absolute path)
     *
     * @param path - The path from where to search
     */
    getDirectories(path: string): string[] {
        const absolutePath = this.getAbsolutePath(path);
        const node = this._get(absolutePath);

        return node?.type === FSNodeType.Directory
            ? node.children.filter(d => d.type === FSNodeType.Directory).map(d => d.name)
            : [];
    }

    readDirectory(path: string, extensions?: readonly string[]): string[] {
        const absolutePath = this.getAbsolutePath(path);
        const node = this._get(absolutePath);

        if (!node || node.type === FSNodeType.File) {
            return [];
        }

        const basePath = this._getPath(node);
        const fileNames = node.children.filter(f => f.type === FSNodeType.File).map(f => this.join(basePath, f.name));

        if (!extensions) {
            return fileNames;
        }

        return fileNames.filter(f => extensions.some(ext => f.endsWith(ext)));
    }

    deleteFile(path: string): void {
        const absolutePath = this.getAbsolutePath(path);
        const node = this._get(absolutePath);

        if (!node) {
            return;
        }

        if (node.type === FSNodeType.Directory) {
            throw new Error(`Unable to delete the file "${absolutePath}" because it's a directory.`);
        }

        const index = node.parent.children.findIndex(c => c.name === node.name);

        if (index < -1) {
            return;
        }

        node.parent.children.splice(index, 1);
    }

    /**
     * This method is not implemented and calling it, will throw
     * an exception
     */
    exit(): void {
        throw new Error('Method \'exit\' is not supported.');
    }

    /**
     * Normalizes the path based on the OS and makes it
     * relative to the current working directory.
     */
    normalizePath(path: string): string {
        const absolutePath = this.getAbsolutePath(path);
        return absolutePath.split(SEP).slice(1).join(SEP);
    }

    /**
     * Returns the path of the directory
     */
    getDirectoryName(path: string): string {
        return this.getAbsolutePath(path).split(SEP).slice(0, -1).join(SEP);
    }

    /**
     * Returns a string with the filename portion of the path
     */
    getBaseName(path: string): string {
        const absolutePath = this.getAbsolutePath(path);
        const node = this._get(absolutePath);

        if (!node || node.type === FSNodeType.Directory) {
            return '';
        }

        return node.name;
    }

    /**
     * Joins the segments using the path separator of the OS/Browser
     */
    join(...segments: string[]): string {
        return segments.join(SEP);
    }

    /**
     * Checks if the path is an absolute path. An absolute
     * path is a path that starts with the ROOT directory.
     *
     * @returns True if the path is absolute
     */
    isAbsolute(path: string): boolean {
        return path.startsWith(ROOT_DIR);
    }

    /**
     * Transforms the path to an absolute path.
     *
     * It imposes some restrictions about how path are handled to simplify things.
     *
     * The following restrictions will apply:
     *
     * - No directories with only dots in its name
     * - Paths are converted to lowercase
     * - In the name of the file you can have dots
     *
     * A few examples to show how the functions transforms the path:
     *
     * - "./foo.js" -> "<ROOT_DIR>/foo.js"
     * - "." -> "<ROOT_DIR>"
     * - "/foo.js" -> "<ROOT_DIR>/foo.js"
     * - "foo.js" -> "<ROOT_DIR>/foo.js"
     * - "Bar/foo.js" or "./Bar/foo.js" -> "<ROOT_DIR>/bar/foo.js"
     */
    getAbsolutePath(path: string): string {
        // Convert segment to lowercase and remove dots
        const segments = path
            .toLowerCase()
            .split(SEP)
            .filter(segment => !!segment && !/^\.+$/.test(segment));

        if (segments[0] === ROOT_DIR) {
            return segments.join(SEP);
        }

        return [ROOT_DIR, ...segments].join(SEP);
    }

    private async _writeLibFilesFromNodeModules(): Promise<void> {
        const libFiles = await import('./get-lib-files-from-node.js').then(m => m.getLibFilesFromNode());

        for (const [name, content] of libFiles.entries()) {
            this.writeFile(name, content);
        }
    }

    private _writeLibFilesFromCDN(version: string): Promise<void[]> {
        const cdn = `https://typescript.azureedge.net/cdn/${version}/typescript/lib/`;
        const promises: Promise<void>[] = [];

        for (const lib of knownLibFiles) {
            const promise = fetch(cdn + lib)
                .then(resp => resp.text())
                .then(text => this.writeFile(lib, text))
                .catch(err => console.error(err));

            promises.push(promise);
        }

        return Promise.all(promises);
    }

    private _get(absolutePath: string): FSNode | undefined {
        const segments = absolutePath.split(SEP).slice(1); // The first directory is ROOT

        if (!segments.length) {
            return this._fs;
        }

        let node: FSNode | undefined = this._fs as FSNode;
        for (const segment of segments) {
            if (!node) {
                break;
            }

            // There are still segments to process and
            // we are in a file node
            if (node.type === FSNodeType.File) {
                node = undefined;
                break;
            }

            node = node.children.find(c => c.name === segment);
        }

        return node;
    }

    private _setFile(absolutePath: string, data: string): void {
        const segments = absolutePath.split(SEP).slice(1); // The first directory is ROOT
        const parentDirectories = segments.slice(0, -1);
        const newFileName = segments[segments.length - 1] ?? '';

        if (!newFileName) {
            throw new Error(`Empty file name found when trying to write to: "${absolutePath}".`);
        }

        let node = this._fs;
        for (const directoryName of parentDirectories) {
            const child = node.children.find(c => c.name === directoryName);

            if (child?.type === FSNodeType.File) {
                throw new Error(`Expected a directory but found a file when trying to write to: "${absolutePath}".`);
            }

            if (child?.type === FSNodeType.Directory) {
                node = child;
                continue;
            }

            const newChild: FSDirectoryNode = {
                type: FSNodeType.Directory,
                name: directoryName,
                children: [],
                parent: node,
            };

            node.children.push(newChild);
            node = newChild;
        }

        const existingFileNode = node.children.find((f): f is FSFileNode => {
            return f.name === newFileName && f.type === FSNodeType.File;
        });

        if (existingFileNode) {
            existingFileNode.data = data;
            return;
        }

        const newFileNode: FSFileNode = {
            data,
            type: FSNodeType.File,
            name: newFileName,
            parent: node,
        };

        node.children.push(newFileNode);
    }

    private _setDirectory(absolutePath: string): void {
        const segments = absolutePath.split(SEP).slice(1); // The first directory is ROOT

        let node = this._fs;
        for (const segment of segments) {
            const child = node.children.find(c => c.name === segment);

            if (child?.type === FSNodeType.File) {
                throw new Error(`Expected a directory but found a file when trying to write to: "${absolutePath}".`);
            }

            if (child?.type === FSNodeType.Directory) {
                node = child;
                continue;
            }

            const newChild: FSDirectoryNode = {
                type: FSNodeType.Directory,
                name: segment,
                children: [],
                parent: node,
            };

            node.children.push(newChild);
            node = newChild;
        }
    }

    private _getPath(node: FSNode): string {
        let curr: FSNode | null = node;
        const path: string[] = [];

        while (curr) {
            path.push(curr.name);
            curr = curr.parent;
        }

        return path.reverse().join(SEP);
    }
}
