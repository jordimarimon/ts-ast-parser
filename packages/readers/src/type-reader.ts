import { Type } from '@ts-ast-parser/core';


export class TypeReader {

    private readonly _type: Type;

    constructor(type: Type) {
        this._type = type;
    }

    getValue(): string {
        return this._type.text ?? '';
    }

    getSourceReference(): string {
        return this._type.source?.path ?? '';
    }

}
