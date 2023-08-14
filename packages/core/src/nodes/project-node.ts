import type { AnalyserContext } from '../analyser-context.js';
import type { IPackageJson } from 'package-json-type';
import { ModuleNode } from './module-node.js';
import type ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';


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

    getName(): string {
        return this._packageJson?.name ?? '';
    }

    private _getPackageJSON(): IPackageJson | null {
        const options = this._context.getOptions();
        const projectDir = options.tsConfigFilePath ? path.dirname(options.tsConfigFilePath) : process.cwd();

        const packageDir = path.join(projectDir, 'package.json');
        const pkgJSON = fs.existsSync(packageDir) ? fs.readFileSync(packageDir, 'utf-8') : null;

        try {
            return pkgJSON != null ? (JSON.parse(pkgJSON) as IPackageJson) : null;
        } catch (_) {
            return null;
        }
    }
}
