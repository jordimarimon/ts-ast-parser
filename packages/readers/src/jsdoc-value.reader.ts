import { JSDocTagValue } from '@ts-ast-parser/core';


export class JSDocValueReader {

    private readonly _jsDocTagValue: JSDocTagValue;

    constructor(jsDocTagValue: JSDocTagValue) {
        this._jsDocTagValue = jsDocTagValue;
    }

    getRawValue(): JSDocTagValue {
        return this._jsDocTagValue;
    }

    getDescription(): string {
        if (typeof this._jsDocTagValue === 'string') {
            return this._jsDocTagValue;
        }

        if (typeof this._jsDocTagValue === 'boolean') {
            return '';
        }

        return this._jsDocTagValue.description ?? '';
    }

    getName(): string {
        if (typeof this._jsDocTagValue === 'string' || typeof this._jsDocTagValue === 'boolean') {
            return '';
        }

        return this._jsDocTagValue.name ?? '';
    }

    getType(): string {
        if (typeof this._jsDocTagValue === 'string' || typeof this._jsDocTagValue === 'boolean') {
            return '';
        }

        return this._jsDocTagValue.type ?? '';
    }

    getDefault(): string {
        if (typeof this._jsDocTagValue === 'string' || typeof this._jsDocTagValue === 'boolean') {
            return '';
        }

        return this._jsDocTagValue.default ?? '';
    }

    isOptional(): boolean {
        if (typeof this._jsDocTagValue === 'string' || typeof this._jsDocTagValue === 'boolean') {
            return false;
        }

        return !!this._jsDocTagValue.optional;
    }

}
