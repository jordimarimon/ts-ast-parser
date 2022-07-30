import { JSDoc, JSDocNode, JSDocTagType } from '../models';
import { isNotEmptyArray } from './helpers';
import ts from 'typescript';


/**
 * Returns true if the node should not be documented
 */
export function shouldIgnore(node: ts.Node): boolean {
    return !!(node as JSDocNode).jsDoc?.some(doc => {
        return doc?.tags?.some(tag => {
            const tagName = tag?.tagName?.getText?.();

            return tagName === 'ignore' ||
                tagName === 'internal' ||
                tagName === 'private' ||
                tagName === 'protected';
        });
    });
}

export function getJSTagComment(comment: string | ts.NodeArray<ts.JSDocComment> | undefined): string {
    if (!comment) {
        return '';
    }

    if (isNotEmptyArray<ts.NodeArray<ts.JSDocComment>>(comment)) {
        return comment.map(com => com?.text ?? '').join('');
    }

    return comment;
}

/**
 * Gets all the information inside a JSDoc Node
 */
export function getJSDoc(node: JSDocNode): Partial<JSDoc> {
    const doc: Partial<JSDoc> = {};

    for (const jsDocComment of (node.jsDoc ?? [])) {
        //
        // Description
        //
        if (jsDocComment?.comment) {
            doc[JSDocTagType.description] = jsDocComment.comment;
        }

        for (const tag of (jsDocComment?.tags ?? [])) {
            const name = String(tag.tagName?.escapedText ?? '');
            let text = '';

            if (ts.isJSDocSeeTag(tag)) {
                // JSDoc See Tag separates the scheme from the rest of the URL
                text = (tag.name?.name?.getText() ?? '') + tag.comment;
            } else {
                text = getJSTagComment(tag.comment);
            }

            // TODO(Jordi M.): Format the value based on the type of tag

            doc[name] = text;
        }
    }

    return doc;
}
