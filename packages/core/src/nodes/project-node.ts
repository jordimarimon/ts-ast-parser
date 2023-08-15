import type { AnalyserContext } from '../analyser-context.js';
import type { IPackageJson } from 'package-json-type';
import { ModuleNode } from './module-node.js';
import type ts from 'typescript';


export class ProjectNode {

    private readonly _context: AnalyserContext;

    private readonly _modules: ModuleNode[] = [];

    private readonly _packageJson: IPackageJson | null = null;

    constructor(sourceFiles: readonly ts.SourceFile[], context: AnalyserContext) {
        this._modules = sourceFiles.map(sourceFile => new ModuleNode(sourceFile, context));
        this._context = context;
        this._packageJson = this._getPackageJSON();
    }

    getContext(): AnalyserContext {
        return this._context;
    }

    getModules(): ModuleNode[] {
        return this._modules;
    }

    has(filePath: string): boolean {
        const normalizedPath = this._context.getSystem().normalizePath(filePath);
        return this._modules.some(m => m.getSourcePath() === normalizedPath);
    }

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

    getName(): string {
        return this._packageJson?.name ?? '';
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
