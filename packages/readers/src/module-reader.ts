import { Declaration, DeclarationKind, JSDocTagName, Module } from '@ts-ast-parser/core';
import { DeclarationReader } from './declaration-reader.js';
import { TypeAliasReader } from './type-alias-reader.js';
import { InterfaceReader } from './interface-reader.js';
import { VariableReader } from './variable-reader.js';
import { FunctionReader } from './function-reader.js';
import { ImportReader } from './import-reader.js';
import { ExportReader } from './export-reader.js';
import { MixinReader } from './mixin-reader.js';
import { ClassReader } from './class-reader.js';
import { EnumReader } from './enum-reader.js';


export class ModuleReader {

    private readonly _module: Module;

    private readonly _imports: ImportReader[];

    private readonly _exports: ExportReader[];

    private readonly _declarations: DeclarationReader[];

    constructor(module: Module) {
        this._module = module;
        this._imports = module.imports.map(imp => new ImportReader(imp));
        this._exports = module.exports.map(exp => new ExportReader(exp));
        this._declarations = module.declarations.map(decl => this._createDeclarationReader(decl));
    }

    getPath(): string {
        return this._module.path ?? '';
    }

    getImports(): ImportReader[] {
        return this._imports;
    }

    getExports(): ExportReader[] {
        return this._exports;
    }

    getDeclarations(): DeclarationReader[] {
        return this._declarations;
    }

    getDeclarationByKind(kind: DeclarationKind): DeclarationReader[] {
        return this._declarations.filter(decl => decl.getKind() === kind);
    }

    getDeclarationByName(name: string): DeclarationReader | null {
        return this._declarations.find(decl => decl.getName() === name) ?? null;
    }

    getDeclarationsByCategory(category: string): DeclarationReader[] {
        return this._declarations.filter(decl => decl.getJSDocTag(JSDocTagName.category) === category);
    }

    private _createDeclarationReader(decl: Declaration): DeclarationReader {
        switch (decl.kind) {
            case DeclarationKind.class:
                return new ClassReader(decl);
            case DeclarationKind.enum:
                return new EnumReader(decl);
            case DeclarationKind.function:
                return new FunctionReader(decl);
            case DeclarationKind.interface:
                return new InterfaceReader(decl);
            case DeclarationKind.mixin:
                return new MixinReader();
            case DeclarationKind.typeAlias:
                return new TypeAliasReader(decl);
            case DeclarationKind.variable:
                return new VariableReader(decl);
        }
    }
}
