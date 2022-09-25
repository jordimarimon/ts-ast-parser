import { TypeParameter } from '@ts-ast-parser/core';


export class TypeParameterReader {

    private readonly _param: TypeParameter;

    constructor(typeParameter: TypeParameter) {
        this._param = typeParameter;
    }

    getName(): string {
        return this._param.name ?? '';
    }

    getDefault(): string {
        return this._param.default ?? '';
    }

    hasDefault(): boolean {
        return !!this._param.default;
    }

}
