import type { JSDoc, JSDocTSComment, JSDocTSNode, JSDocTagValue } from '../models/js-doc.js';
import type { Spec } from 'comment-parser/primitives';
import { JSDocTagName } from '../models/js-doc.js';
import { parse } from 'comment-parser';


/**
 * Returns all the JSDoc comments in a given node
 *
 * @param node - The node to extract the JSDoc from
 *
 * @returns The JSDoc
 */
export function getAllJSDoc(node: JSDocTSNode): JSDoc {
    const doc: JSDoc = [];

    for (const jsDocComment of (node.jsDoc ?? [])) {
        collectJsDoc(jsDocComment, doc);
    }

    return doc;
}

function collectJsDoc(jsDocComment: JSDocTSComment, doc: JSDoc): void {
    const parsedJsDocComment = parse(jsDocComment.getFullText(), {spacing: 'preserve'}) ?? [];

    for (const block of parsedJsDocComment) {
        if (block.problems.length) {
            continue;
        }

        const descriptionValue = trimNewLines(block.description ?? '');

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
                value: getJSTagValue(name, tag),
            });
        }
    }
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function getJSTagValue(tagName: string, tag: Spec): JSDocTagValue {
    const result: JSDocTagValue = {};
    const descriptionValue = trimNewLines(normalizeDescription(tag.description ?? ''));
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

function trimNewLines(str = ''): string {
    return str.trim().replace(/^\s+|\s+$/g, '').trim();
}

function normalizeDescription(desc = ''): string {
    if (desc.startsWith('- ')) {
        return desc.slice(2);
    }

    return desc;
}
