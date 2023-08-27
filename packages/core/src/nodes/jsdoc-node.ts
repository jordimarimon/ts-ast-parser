import { JSDocValueNode } from './jsdoc-value-node.js';
import type { DocComment } from '../models/js-doc.js';
import { DocTagName } from '../models/js-doc.js';
import ts from 'typescript';


/**
 * Reflected node that represents a documentation comment
 *
 * @see {@link https://tsdoc.org/}
 * @see {@link https://jsdoc.app/}
 */
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

            this._jsDoc[tag.kind]?.push(new JSDocValueNode(tag.kind, tag.value));
        }
    }

    /**
     * Whether the comment has the specified tag
     *
     * @param name - The name of the documentation tag to check
     */
    hasTag(name: string): boolean {
        return this._jsDoc[name] !== undefined;
    }

    /**
     * Returns the first tag with the given name.
     *
     * @param name - The name of the tag.
     * @returns The first tag with the given name or `undefined` if no such tag exists.
     */
    getTag(name: string): JSDocValueNode | undefined {
        return this._jsDoc[name]?.[0];
    }

    /**
     * Returns all the matches found for the given tag.
     * A tag may appear more than once in a documentation comment.
     * For example `@param` can appear multiple times. This method
     * will return all the appearances of a given tag.
     *
     * @param name - The name of the tag to search
     */
    getAllTags(name: string): JSDocValueNode[] {
        return this._jsDoc[name] ?? [];
    }

    /**
     * Whether the documentation comment has tags that make the
     * associated declaration ignored for documentation purposes.
     */
    isIgnored(): boolean {
        return (
            this.hasTag(DocTagName.ignore) || this.hasTag(DocTagName.internal) || this.hasTag(DocTagName.private)
        );
    }

    /**
     * The reflected node as a serializable object
     */
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _collect(_text: string): DocComment {
        return [];
    }
}
