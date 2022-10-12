import { JSDoc, JSDocTagValue } from '@ts-ast-parser/core';
import { JSDocValueReader } from './jsdoc-value.reader.js';


export class JSDocReader {

    private readonly _jsDoc: {[key: string]: JSDocValueReader} = {};

    constructor(jsDoc: JSDoc = []) {
        jsDoc.forEach(tag => {
            this._jsDoc[tag.kind] = new JSDocValueReader(tag.value as JSDocTagValue);
        });
    }

    hasJSDocTag(name: string): boolean {
        return this._jsDoc[name] !== undefined;
    }

    getJSDocTag(name: string): JSDocValueReader | undefined {
        return this._jsDoc[name];
    }
}
