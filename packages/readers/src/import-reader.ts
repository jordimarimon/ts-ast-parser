import { Import, ImportType } from '@ts-ast-parser/core';


export class ImportReader {

    private readonly _name: string;

    private readonly _kind: ImportType;

    private readonly _path: string;

    private readonly _originalPath: string;

    private readonly _isBareModule: boolean;

    private readonly _isTypeOnly: boolean;

    constructor(imp: Import) {
        this._name = imp.name;
        this._kind = imp.kind;
        this._path = imp.importPath;
        this._originalPath = imp.originalPath ?? imp.importPath;
        this._isBareModule = !!imp.isBareModuleSpecifier;
        this._isTypeOnly = !!imp.isTypeOnly;
    }

    getName(): string {
        return this._name;
    }

    getKind(): ImportType {
        return this._kind;
    }

    getPath(): string {
        return this._path;
    }

    getOriginalPath(): string {
        return this._originalPath;
    }

    isBareModule(): boolean {
        return this._isBareModule;
    }

    isTypeOnly(): boolean {
        return this._isTypeOnly;
    }

}
