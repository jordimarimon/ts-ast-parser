import { DeclarationKind, Module } from '@ts-ast-parser/core';
import { ModuleReader } from './module-reader.js';


export class Reader {

    private readonly _modules: ModuleReader[];

    constructor(modules: Module[]) {
        this._modules = modules.map(mod => new ModuleReader(mod));
    }

    getAll(): ModuleReader[] {
        return this._modules;
    }

    getAllModulesWithPath(path: string): ModuleReader[] {
        const regExp = new RegExp(path);

        return this._modules.filter(mod => regExp.test(mod.getPath()));
    }

    getAllModulesWithDeclarationKind(kind: DeclarationKind): ModuleReader[] {
        return this._modules.filter(mod => !!mod.getDeclarationByKind(kind).length);
    }

    getAllModulesWithImport(importSymbolName: string): ModuleReader[] {
        return this._modules.filter(mod => mod.getImports().find(imp => imp.getName() === importSymbolName));
    }

}
