import { type CommentPart, parse, type ParserResult } from '@ts-ast-parser/comment';
import ts from 'typescript';


/**
 * Reflected node that represents a documentation comment
 *
 * @see {@link https://tsdoc.org/}
 * @see {@link https://jsdoc.app/}
 */
export class CommentNode {

    private _parts: CommentPart[] = [];

    constructor(node: ts.Node) {
        this._parseComments(node);
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

    // eslint-disable-next-line sonarjs/cognitive-complexity
    private _parseComments(node: ts.Node): void {
        const isSourceFile = ts.isSourceFile(node);

        let sourceCode: string | undefined;
        let jsDocNode: ts.Node | undefined;

        if (isSourceFile) {
            jsDocNode = ts.forEachChild(node, n => n);
            sourceCode = node.text;
        } else {
            jsDocNode = node;
            sourceCode = node.getSourceFile()?.text;
        }

        if (!sourceCode || !jsDocNode) {
            return;
        }

        let ranges = ts.getLeadingCommentRanges(sourceCode, jsDocNode.pos) ?? [];

        if (!ranges.length) {
            return;
        }

        if (isSourceFile) {
            // If there is more than one leading JSDoc block, grab all but the last,
            // otherwise grab the one
            ranges = ranges.slice(0, ranges.length > 1 ? -1 : 1);
        } else {
            // For declarations, we only care about one JSDoc
            ranges = [ranges[ranges.length - 1] as ts.CommentRange];
        }

        for (const range of ranges) {
            const comment = sourceCode.substring(range.pos, range.end);

            let parserResult: ParserResult | undefined;
            try {
                parserResult = parse(comment);
            } catch (_) {
                // TODO(Jordi M.): Handle the error accordingly
            }

            if (!parserResult || parserResult.error) {
                continue;
            }

            const isModuleJSDoc = parserResult.parts.some(p => {
                return p.kind === 'module' || p.kind === 'fileoverview' || p.kind === 'packageDocumentation';
            });

            if ((!isSourceFile && isModuleJSDoc) || (ranges.length === 1 && isSourceFile && !isModuleJSDoc)) {
                continue;
            }

            this._parts = this._parts.concat(parserResult.parts);
        }
    }
}
