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

            if (name === JSDocTagName.typedef) {
                continue;
            }

            doc.push({
                kind: name,
                value: getJSTagValue(name, tag),
            });
        }
    }
}

function getJSTagValue(name: string, tag: Spec): JSDocTagValue {
    const result: JSDocTagValue = {};
    const defaultValue = tag.default ?? '';
    const descriptionValue = trimNewLines(normalizeDescription(tag.description ?? ''));
    const nameValue = tag.name ?? '';
    const typeValue = tag.type ?? '';
    const hasDefault = defaultValue !== '';
    const hasOptional = tag.optional;
    const hasType = typeValue !== '';

    if (hasDefault) {
        result.default = defaultValue;
    }

    if (hasOptional) {
        result.optional = true;
    }

    if (hasType) {
        result.type = typeValue;
    }

    if (name) {
        result.name = nameValue;
    }

    if (descriptionValue) {
        result.description = descriptionValue;
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
