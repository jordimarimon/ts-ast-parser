import type { IPackageJson } from 'package-json-type';
import type { AnalyzerContext } from '../context.js';
import { ModuleNode } from './module-node.js';
import * as path from 'path';
import type ts from 'typescript';
import * as fs from 'fs';


export class ProjectNode {

    private readonly _context: AnalyzerContext;

    private readonly _modules: ModuleNode[] = [];

    private readonly _packageJson: IPackageJson | null = null;

    constructor(sourceFiles: readonly ts.SourceFile[], context: AnalyzerContext) {
        this._modules = sourceFiles.map(sourceFile => new ModuleNode(sourceFile, context));
        this._context = context;
        this._packageJson = this._getPackageJSON();
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getModules(): ModuleNode[] {
        return this._modules;
    }

    getName(): string {
        return this._packageJson?.name ?? '';
    }

    private _getPackageJSON(): IPackageJson | null {
        const projectDir = this._context.options?.tsConfigFilePath
            ? path.dirname(this._context.options.tsConfigFilePath)
            : process.cwd();

        const packageDir = path.join(projectDir, 'package.json');
        const pkgJSON = fs.existsSync(packageDir) ? fs.readFileSync(packageDir, 'utf-8') : null;

        if (pkgJSON != null) {
            return JSON.parse(pkgJSON) as IPackageJson;
        }

        return null;
    }
}
