import { Import, ImportType } from '@ts-ast-parser/core';


export class ImportReader {

    private readonly _import: Import;

    constructor(imp: Import) {
        this._import = imp;
    }

    getName(): string {
        return this._import.name ?? '';
    }

    getKind(): ImportType {
        return this._import.kind;
    }

    getPath(): string {
        return this._import.importPath ?? '';
    }

    getOriginalPath(): string {
        return this._import.originalPath ?? '';
    }

    isBareModule(): boolean {
        return !!this._import.isBareModuleSpecifier;
    }

    isTypeOnly(): boolean {
        return !!this._import.isTypeOnly;
    }

}
