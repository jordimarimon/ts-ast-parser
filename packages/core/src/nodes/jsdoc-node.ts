import type { DocComment, DocTagValue } from '../models/js-doc.js';
import { JSDocValueNode } from './jsdoc-value-node.js';
import type { Spec } from 'comment-parser/primitives';
import { DocTagName } from '../models/js-doc.js';
import { parse } from 'comment-parser';
import ts from 'typescript';


// FIXME(Jordi M.): This is not a correct solution. We should implement a lexer and a parser...
//  For inspiration:
//      - https://github.com/TypeStrong/typedoc/tree/master/src/lib/converter/comments
//      - https://github.com/TypeStrong/typedoc/tree/master/src/lib/models/comments
//      - https://github.com/microsoft/tsdoc/blob/main/tsdoc/src/beta/DeclarationReference.grammarkdown
//      - https://github.com/microsoft/tsdoc/blob/main/tsdoc/src/beta/DeclarationReference.ts
//      - https://github.com/microsoft/tsdoc/tree/main/tsdoc/src/parser

export class JSDocNode {

    // There could be more than one JSDoc tag with the same name.
    // For example the `@param` tag can be used multiple times.
    private readonly _jsDoc: Record<string, JSDocValueNode[]> = {};

    constructor(node: ts.Node) {
        const comment = this._getComment(node);
        const tags = this._collect(comment);

        for (const tag of tags) {
            if (this._jsDoc[tag.kind] === undefined) {
                this._jsDoc[tag.kind] = [];
            }

            this._jsDoc[tag.kind]?.push(new JSDocValueNode(tag.value));
        }
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
        return (
            this.hasTag(DocTagName.ignore) || this.hasTag(DocTagName.internal) || this.hasTag(DocTagName.private)
        );
    }

    serialize(): DocComment {
        return Object.entries(this._jsDoc).flatMap(([kind, value]) => {
            return value.map(v => ({ kind, value: v.serialize() }));
        });
    }

    private _getComment(node: ts.Node): string {
        const sourceCode = node.getSourceFile()?.text;

        if (!sourceCode) {
            return '';
        }

        const leadingComments = ts.getLeadingCommentRanges(sourceCode, node.pos) ?? [];

        return leadingComments.map(comment => sourceCode.substring(comment.pos, comment.end)).join('\n');
    }

    private _collect(text: string): DocComment {
        const doc: DocComment = [];
        const parsedJsDocComment = parse(text, {spacing: 'preserve'});

        for (const block of parsedJsDocComment) {
            if (block.problems.length) {
                continue;
            }

            const descriptionValue = this._trimNewLines(block.description ?? '');

            if (descriptionValue !== '') {
                doc.push({
                    kind: DocTagName.description,
                    value: descriptionValue,
                });
            }

            for (const tag of block.tags) {
                const name = tag.tag ?? '';

                doc.push({
                    kind: name,
                    value: this._getTagValue(name, tag),
                });
            }
        }

        return doc;
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    private _getTagValue(tagName: string, tag: Spec): DocTagValue {
        const result: DocTagValue = {};
        const typeValue = tag.type ?? '';
        const defaultValue = tag.default ?? '';
        const descriptionValue = this._trimNewLines(this._normalizeDescription(tag.description ?? ''));
        const nameValue = tag.name ?? '';

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
        if (metadataCount === 1 && (result.description ?? result.name)) {
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
        return str.replace(/^\s+|\s+$/g, '');
    }

    private _normalizeDescription(desc = ''): string {
        if (desc.startsWith('- ')) {
            return desc.slice(2);
        }

        return desc;
    }
}
