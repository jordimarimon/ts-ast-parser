import { JSDoc, JSDocTagName, JSDocTagValue } from '@ts-ast-parser/core';


export class JSDocReader {

    private readonly _jsDoc: JSDoc;

    constructor(jsDoc: JSDoc = []) {
        this._jsDoc = jsDoc;
    }

    getJSDocTag(name: string): JSDocTagValue {
        return this._jsDoc.find(tag => tag.kind === name) as JSDocTagValue;
    }

    hasJSDocTag(name: string): boolean {
        return this._jsDoc.some(tag => tag.kind === name);
    }

    getJSDocDescription(): string {
        const tagValue = this.getJSDocTag(JSDocTagName.description) as string;

        return tagValue ?? '';
    }

    getJSDocSummary(): string {
        const tagValue = this.getJSDocTag(JSDocTagName.summary) as string;

        return tagValue ?? '';
    }

    isDeprecated(): boolean {
        return this._jsDoc.some(tag => tag.kind === JSDocTagName.deprecated);
    }
}
