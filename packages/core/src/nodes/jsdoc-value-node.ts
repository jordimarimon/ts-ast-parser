import type { JSDocTagValue } from '../models/js-doc.js';


export class JSDocValueNode {

    private readonly _jsDocTagValue: JSDocTagValue;

    constructor(jsDocTagValue: JSDocTagValue) {
        this._jsDocTagValue = jsDocTagValue;
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

    getValue<T>(): T | undefined {
        if (typeof this._jsDocTagValue === 'string' || typeof this._jsDocTagValue === 'boolean') {
            return this._jsDocTagValue as T;
        }

        return this._jsDocTagValue.value as T;
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

    serialize(): JSDocTagValue {
        return this._jsDocTagValue;
    }
}
