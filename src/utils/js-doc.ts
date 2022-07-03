import { JSDoc, JSDocNode, JSDocTagType } from '../models';


/**
 * Returns true if the node has as JSDoc tag "@internal" or "@ignore"
 */
export function shouldIgnore(node: JSDocNode): boolean {
    return !!node.jsDoc?.some(doc => {
        return doc?.tags?.some(tag => {
            const tagName = tag?.tagName?.getText?.();

            return tagName === 'ignore' ||
                tagName === 'internal' ||
                tagName === 'private' ||
                tagName === 'protected';
        });
    });
}

/**
 * Gets the JSDoc
 */
export function getJSDoc(node: JSDocNode, tags: JSDocTagType[]): JSDoc[] {
    const doc: JSDoc[] = [];

    for (const jsDocComment of (node.jsDoc ?? [])) {
        //
        // Description
        //
        if (jsDocComment.comment && tags.includes(JSDocTagType.DESCRIPTION)) {
            doc.push({
                name: JSDocTagType.DESCRIPTION,
                value: jsDocComment.comment,
            });
        }
    }

    //
    // @param
    //

    //
    // @returns
    //

    //
    // @type
    //

    //
    // @reflect
    //

    //
    // @summary
    //

    //
    // @default
    //

    //
    // @readonly
    //

    //
    // @deprecated
    //

    //
    // @example
    //

    //
    // @override
    //

    //
    // @see
    //

    //
    // @since
    //

    //
    // @throws
    //

    //
    // @public, @private, @protected
    //

    return doc;
}
