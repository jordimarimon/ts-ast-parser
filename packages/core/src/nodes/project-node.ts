import type { AnalyserContext } from '../analyser-context.js';
import type { IPackageJson } from 'package-json-type';
import type { Module } from '../models/module.js';
import { ModuleNode } from './module-node.js';
import type ts from 'typescript';


/**
 * Represents a collection of modules (TypeScript/JavaScript files) that have been
 * successfully analysed.
 */
export class ProjectNode {

    private readonly _context: AnalyserContext;

    private readonly _modules: ModuleNode[] = [];

    private readonly _packageJson: IPackageJson | null = null;

    constructor(sourceFiles: readonly ts.SourceFile[], context: AnalyserContext) {
        this._modules = sourceFiles.map(sourceFile => new ModuleNode(sourceFile, context));
        this._context = context;
        this._packageJson = this._getPackageJSON();
    }

    /**
     * The analyser context
     */
    getContext(): AnalyserContext {
        return this._context;
    }

    /**
     * The reflected modules
     */
    getModules(): ModuleNode[] {
        return this._modules;
    }

    /**
     * Whether the given source file path is present in the reflected modules
     *
     * @param filePath - The source file path to check
     *
     * @returns True if the source file has been already analysed, false otherwise
     */
    has(filePath: string): boolean {
        const normalizedPath = this._context.getSystem().normalizePath(filePath);
        return this._modules.some(m => m.getSourcePath() === normalizedPath);
    }

    /**
     * Adds a new source file to the collection of reflected modules.
     *
     * Will throw an error if the source file already exists.
     *
     * @param filePath - The path of the new source file
     * @param content - The content of the source file
     *
     * @returns The new reflected module
     */
    add(filePath: string, content: string): ModuleNode {
        const normalizedPath = this._context.getSystem().normalizePath(filePath);
        const module = this._modules.find(m => m.getSourcePath() === normalizedPath);

        if (module) {
            throw new Error('File already exist');
        }

        const newSourceFile = this._context.upsertFile(normalizedPath, content);
        const newModuleNode = new ModuleNode(newSourceFile, this._context);

        this._modules.push(newModuleNode);

        return newModuleNode;
    }

    /**
     * Updates the content of an existing source file.
     *
     * Will throw an error if the source file doesn't exist.
     *
     * @param filePath - The path of the source file to update
     * @param content - The new content of the source file
     *
     * @returns The updated reflected module
     */
    update(filePath: string, content: string): ModuleNode {
        const normalizedPath = this._context.getSystem().normalizePath(filePath);
        const absolutePath = this._context.getSystem().getAbsolutePath(normalizedPath);
        const moduleIdx = this._modules.findIndex(m => m.getSourcePath() === normalizedPath);

        if (moduleIdx < 0) {
            throw new Error('The file doesn\'t exist');
        }

        // FIXME(Jordi M.): In case of updating an existing file, we should
        //  update also all the source files that depend on it

        const newSourceFile = this._context.upsertFile(absolutePath, content);
        const newModuleNode = new ModuleNode(newSourceFile, this._context);

        this._modules.splice(moduleIdx, 1, newModuleNode);

        return newModuleNode;
    }

    /**
     * The name of the package defined in the `package.json` in
     * case one was found
     */
    getName(): string {
        return this._packageJson?.name ?? '';
    }

    /**
     * The reflected node as a serializable object
     */
    serialize(): Module[] {
        return this._modules.map(m => m.serialize());
    }

    private _getPackageJSON(): IPackageJson | null {
        const system = this._context.getSystem();
        const options = this._context.getOptions();
        const projectDir = options.tsConfigFilePath
            ? system.getDirName(options.tsConfigFilePath)
            : system.getCurrentDirectory();

        const packageDir = system.join(projectDir, 'package.json');
        const pkgJSON = system.fileExists(packageDir) ? system.readFile(packageDir) : null;

        try {
            return pkgJSON != null ? (JSON.parse(pkgJSON) as IPackageJson) : null;
        } catch (_) {
            return null;
        }
    }
}
