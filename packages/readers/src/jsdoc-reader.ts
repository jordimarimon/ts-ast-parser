import { JSDoc, JSDocTagValue } from '@ts-ast-parser/core';


export class JSDocReader {

    private readonly _jsDoc: {[key: string]: JSDocTagValue} = {};

    constructor(jsDoc: JSDoc = []) {
        jsDoc.forEach(tag => {
            this._jsDoc[tag.kind] = tag.value as JSDocTagValue;
        });
    }

    hasJSDocTag(name: string): boolean {
        return this._jsDoc[name] !== undefined;
    }

    getJSDocTag(name: string): JSDocTagValue | undefined {
        return this._jsDoc[name];
    }
}
