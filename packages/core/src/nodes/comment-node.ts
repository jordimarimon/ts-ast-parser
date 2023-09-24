import { type CommentPart, parse } from '@ts-ast-parser/comment';
import ts from 'typescript';


/**
 * Reflected node that represents a documentation comment
 *
 * @see {@link https://tsdoc.org/}
 * @see {@link https://jsdoc.app/}
 */
export class CommentNode {

    // There could be more than one JSDoc tag with the same name.
    private readonly _parts: CommentPart[] = [];

    constructor(node: ts.Node) {
        const comment = this._getComment(node);

        try {
            this._parts = parse(comment).parts;
        } catch (_) {
            // TODO
        }
    }

    /**
     * Whether the comment has the specified tag
     *
     * @param name - The name of the documentation tag to check
     */
    hasTag(name: string): boolean {
        return this._parts.some(p => p.kind === name);
    }

    /**
     * Returns the first tag with the given name.
     *
     * @param name - The name of the tag.
     * @returns The first tag with the given name or `undefined` if no such tag exists.
     */
    getTag(name: string): CommentPart | undefined {
        return this._parts.find(p => p.kind === name);
    }

    /**
     * Returns all the matches found for the given tag.
     * A tag may appear more than once in a documentation comment.
     * For example `@param` can appear multiple times. This method
     * will return all the appearances of a given tag.
     *
     * @param name - The name of the tag to search
     */
    getAllTags(name: string): CommentPart[] {
        return this._parts.filter(p => p.kind === name);
    }

    /**
     * Whether the documentation comment has tags that make the
     * associated declaration ignored for documentation purposes.
     */
    isIgnored(): boolean {
        return this._parts.some(p => {
            return p.kind === 'ignore' || p.kind === 'internal' || p.kind === 'private';
        });
    }

    /**
     * The reflected node as a serializable object
     */
    serialize(): CommentPart[] {
        return this._parts;
    }

    private _getComment(node: ts.Node): string {
        const sourceCode = node.getSourceFile()?.text;

        if (!sourceCode) {
            return '';
        }

        const leadingComments = ts.getLeadingCommentRanges(sourceCode, node.pos) ?? [];
        return leadingComments.map(comment => sourceCode.substring(comment.pos, comment.end)).join('\n');
    }
}
