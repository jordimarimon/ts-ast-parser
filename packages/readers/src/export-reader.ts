import { Export, ExportType } from '@ts-ast-parser/core';


export class ExportReader {

    private readonly _export: Export;

    constructor(exp: Export) {
        this._export = exp;
    }

    getName(): string {
        return this._export.name ?? '';
    }

    getType(): ExportType {
        return this._export.type;
    }

    getReferenceName(): string {
        return this._export.referenceName ?? '';
    }

    isTypeOnly(): boolean {
        return !!this._export.isTypeOnly;
    }

    isReexport(): boolean {
        return this._export.referenceName != undefined;
    }

}
