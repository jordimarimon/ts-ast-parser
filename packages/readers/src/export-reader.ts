import { Export, ExportType } from '@ts-ast-parser/core';


export class ExportReader {

    private readonly _name: string;

    private readonly _type: ExportType;

    private readonly _isTypeOnly: boolean;

    private readonly _referenceName: string | undefined;

    constructor(exp: Export) {
        this._name = exp.name;
        this._type = exp.type;
        this._isTypeOnly = !!exp.isTypeOnly;
        this._referenceName = exp.referenceName;
    }

    getName(): string {
        return this._name;
    }

    getType(): ExportType {
        return this._type;
    }

    getReferenceName(): string {
        return this._referenceName ?? '';
    }

    isTypeOnly(): boolean {
        return this._isTypeOnly;
    }

    isReexport(): boolean {
        return this._referenceName != undefined;
    }

}
