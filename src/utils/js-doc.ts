import { JSDoc, JSDocComment, JSDocNode, JSDocTagType } from '../models';
import { parse, Spec } from 'comment-parser';
import { logWarning } from './logs';
import ts from 'typescript';


export function shouldIgnore(node: ts.Node): boolean {
    return !!(node as JSDocNode).jsDoc?.some(doc => {
        return doc?.tags?.some(tag => {
            const tagName = tag?.tagName?.getText?.();

            return tagName === JSDocTagType.ignore ||
                tagName === JSDocTagType.internal ||
                tagName === JSDocTagType.private ||
                tagName === JSDocTagType.protected;
        });
    });
}

export function getJSDoc(node: JSDocNode): Partial<JSDoc> {
    const doc: Partial<JSDoc> = {};

    for (const jsDocComment of (node.jsDoc ?? [])) {
        collectJsDoc(jsDocComment, doc);
    }

    return doc;
}

function collectJsDoc(jsDocComment: JSDocComment, doc: Partial<JSDoc>): void {
    const parsedJsDocComment = parse(jsDocComment.getFullText()) ?? [];

    for (const block of parsedJsDocComment) {
        if (block.problems.length) {
            logWarning('There have been problems while parsing the JSDoc: ', block.problems);
        }

        doc[JSDocTagType.description] = block.description ?? '';

        for (const tag of block.tags) {
            const name = tag.tag ?? '';

            doc[name] = getJSTagValue(name, tag);
        }
    }
}

function getJSTagValue<K extends keyof JSDoc>(name: K, tag: Spec): JSDoc[K] {
    switch (name) {
        case JSDocTagType.returns:
        case JSDocTagType.type:
        case JSDocTagType.summary:
        case JSDocTagType.example:
        case JSDocTagType.default:
        case JSDocTagType.since:
        case JSDocTagType.throws:
        case JSDocTagType.category:
        case JSDocTagType.see:
        case JSDocTagType.tag:
        case JSDocTagType.tagname:
            return tag.name;

        case JSDocTagType.readonly:
        case JSDocTagType.deprecated:
        case JSDocTagType.override:
        case JSDocTagType.public:
        case JSDocTagType.protected:
        case JSDocTagType.private:
        case JSDocTagType.internal:
        case JSDocTagType.ignore:
        case JSDocTagType.reflect:
            return true;

        case JSDocTagType.cssprop:
        case JSDocTagType.cssproperty:
            return {
                name: tag.name,
                default: tag.default,
                description: normalizeDescription(tag.description),
            };

        case JSDocTagType.param:
            return {
                name: tag.name,
                default: tag.default,
                optional: tag.optional,
                description: normalizeDescription(tag.description),
            };

        case JSDocTagType.csspart:
        case JSDocTagType.slot:
        case JSDocTagType.attr:
            return {
                name: tag.name,
                description: normalizeDescription(tag.description),
            };

        case JSDocTagType.fires:
        case JSDocTagType.event:
            return {
                name: tag.name,
                type: tag.type,
                description: normalizeDescription(tag.description),
            };

        default:
            return tag.name;
    }
}

function normalizeDescription(desc: string): string {
    if (desc.startsWith('- ')) {
        return desc.slice(2);
    }

    return desc;
}
