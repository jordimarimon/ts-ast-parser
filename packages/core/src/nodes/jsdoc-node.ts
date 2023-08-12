import type { JSDocTagValue, JSDocTSComment, JSDocTSNode, JSDoc } from '../models/js-doc.js';
import { JSDocValueNode } from './jsdoc-value-node.js';
import type { Spec } from 'comment-parser/primitives';
import { JSDocTagName } from '../models/js-doc.js';
import { parse } from 'comment-parser';
import type ts from 'typescript';


export class JSDocNode {

    // There could be more than one JSDoc tag with the same name.
    // For example the `@param` tag can be used multiple times.
    private readonly _jsDoc: {[key: string]: JSDocValueNode[]} = {};

    constructor(node: ts.Node) {
        this._getAllJSDoc(node).forEach(tag => {
            if (this._jsDoc[tag.kind] === undefined) {
                this._jsDoc[tag.kind] = [];
            }

            this._jsDoc[tag.kind]?.push(new JSDocValueNode(tag.value));
        });
    }

    hasTag(name: string): boolean {
        return this._jsDoc[name] !== undefined;
    }

    /**
     * Returns the first JSDoc tag with the given name.
     *
     * @param name - The name of the JSDoc tag.
     *
     * @returns The first JSDoc tag with the given name or `undefined` if no such tag exists.
     */
    getTag(name: string): JSDocValueNode | undefined {
        return this._jsDoc[name]?.[0];
    }

    getAllTags(name: string): JSDocValueNode[] {
        return this._jsDoc[name] ?? [];
    }

    isIgnored(): boolean {
        return this.hasTag(JSDocTagName.ignore) ||
            this.hasTag(JSDocTagName.internal) ||
            this.hasTag(JSDocTagName.private);
    }

    serialize(): JSDoc {
        return Object.entries(this._jsDoc).flatMap(([kind, value]) => {
            return value.map(v => ({ kind, value: v.serialize() }));
        });
    }

    /**
     * Returns all the JSDoc comments in a given node
     *
     * @param node - The node to extract the JSDoc from
     *
     * @returns The JSDoc
     */
    private _getAllJSDoc(node: JSDocTSNode): JSDoc {
        const doc: JSDoc = [];

        for (const jsDocComment of (node.jsDoc ?? [])) {
            this._collectJsDoc(jsDocComment, doc);
        }

        return doc;
    }

    private _collectJsDoc(jsDocComment: JSDocTSComment, doc: JSDoc): void {
        const parsedJsDocComment = parse(jsDocComment.getFullText(), {spacing: 'preserve'}) ?? [];

        for (const block of parsedJsDocComment) {
            if (block.problems.length) {
                continue;
            }

            const descriptionValue = this._trimNewLines(block.description ?? '');

            if (descriptionValue !== '') {
                doc.push({
                    kind: JSDocTagName.description,
                    value: descriptionValue,
                });
            }

            for (const tag of block.tags) {
                const name = tag.tag ?? '';

                doc.push({
                    kind: name,
                    value: this._getJSTagValue(name, tag),
                });
            }
        }
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    private _getJSTagValue(tagName: string, tag: Spec): JSDocTagValue {
        const result: JSDocTagValue = {};
        const descriptionValue = this._trimNewLines(this._normalizeDescription(tag.description ?? ''));
        const defaultValue = tag.default ?? '';
        const nameValue = tag.name ?? '';
        const typeValue = tag.type ?? '';

        if (defaultValue !== '') {
            result.default = defaultValue;
        }

        if (tag.optional) {
            result.optional = true;
        }

        if (typeValue !== '') {
            result.type = typeValue;
        }

        if (nameValue !== '') {
            result.name = nameValue;
        }

        if (descriptionValue !== '') {
            result.description = descriptionValue;
        }

        const metadataCount = Object.keys(result).length;

        // If there is only one key and is a string key, we simplify the tag
        // value to a string instead of an object
        if (metadataCount === 1 && (result.description || result.name)) {
            return nameValue || descriptionValue;
        }

        // Case when there is no delimiter between the name and the description
        if (metadataCount === 2 && result.description && result.name) {
            const line = tag.source.find(s => s.source.includes(tagName));
            const text = (line?.tokens.name ?? '') + (line?.tokens.description ?? '');

            if (!text.includes('-')) {
                return [nameValue, descriptionValue].join(' ');
            }
        }

        return result;
    }

    private _trimNewLines(str = ''): string {
        return str.trim().replace(/^\s+|\s+$/g, '').trim();
    }

    private _normalizeDescription(desc = ''): string {
        if (desc.startsWith('- ')) {
            return desc.slice(2);
        }

        return desc;
    }

}
