import { JSDoc, JSDocTagName, JSDocTagValue } from '../models/js-doc.js';
import { JSDocValueNode } from './jsdoc-value-node.js';
import { getAllJSDoc } from '../utils/js-doc.js';
import ts from 'typescript';


export class JSDocNode {

    private readonly _jsDoc: {[key: string]: JSDocValueNode} = {};

    constructor(node: ts.Node) {
        getAllJSDoc(node).forEach(tag => {
            this._jsDoc[tag.kind] = new JSDocValueNode(tag.value as JSDocTagValue);
        });
    }

    hasJSDocTag(name: string): boolean {
        return this._jsDoc[name] !== undefined;
    }

    getJSDocTag(name: string): JSDocValueNode | undefined {
        return this._jsDoc[name];
    }

    isIgnored(): boolean {
        return this.hasJSDocTag(JSDocTagName.ignore) ||
            this.hasJSDocTag(JSDocTagName.internal) ||
            this.hasJSDocTag(JSDocTagName.private);
    }

    toPOJO(): JSDoc {
        return Object.entries(this._jsDoc).map(([kind, value]) => ({kind, value: value.toPOJO()}));
    }

}
