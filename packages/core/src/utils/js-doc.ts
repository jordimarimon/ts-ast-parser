import { JSDoc, JSDocComment, JSDocNode, JSDocTagName } from '../models/index.js';
import { Spec } from 'comment-parser/primitives';
import { logError, logWarning } from './logs.js';
import { Context } from '../context.js';
import { parse } from 'comment-parser';
import ts from 'typescript';


export function shouldIgnore(node: ts.Node): boolean {
    return !!(node as JSDocNode).jsDoc?.some(doc => {
        return doc?.tags?.some(tag => {
            const tagName = tag?.tagName?.getText?.();

            return tagName === JSDocTagName.ignore ||
                tagName === JSDocTagName.internal ||
                tagName === JSDocTagName.private ||
                tagName === JSDocTagName.protected;
        });
    });
}

export function getAllJSDoc(node: JSDocNode): JSDoc {
    const doc: JSDoc = [];

    for (const jsDocComment of (node.jsDoc ?? [])) {
        collectJsDoc(jsDocComment, doc);
    }

    return doc;
}

export function findJSDoc<T>(name: JSDocTagName, doc: JSDoc): {kind: JSDocTagName; value: T} | undefined {
    return doc.find(d => d.kind === name) as {kind: JSDocTagName; value: T} | undefined;
}

function collectJsDoc(jsDocComment: JSDocComment, doc: JSDoc): void {
    const parsedJsDocComment = parse(jsDocComment.getFullText()) ?? [];

    for (const block of parsedJsDocComment) {
        if (block.problems.length) {
            logWarning('There have been problems while parsing the JSDoc: ', block.problems);
        }

        doc.push({
            kind: JSDocTagName.description,
            value: block.description ?? '',
        });

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

function getJSTagValue(name: string, tag: Spec): unknown {
    const jsDocHandlers = Context.options.jsDocHandlers ?? {};

    switch (name) {
        case JSDocTagName.returns:
        case JSDocTagName.type:
        case JSDocTagName.summary:
        case JSDocTagName.example:
        case JSDocTagName.default:
        case JSDocTagName.since:
        case JSDocTagName.throws:
        case JSDocTagName.category:
        case JSDocTagName.see:
        case JSDocTagName.tag:
        case JSDocTagName.tagname:
            return normalizeDescription(tag.description ? `${tag.name} ${tag.description}` : tag.name);

        case JSDocTagName.readonly:
        case JSDocTagName.deprecated:
        case JSDocTagName.override:
        case JSDocTagName.public:
        case JSDocTagName.protected:
        case JSDocTagName.private:
        case JSDocTagName.internal:
        case JSDocTagName.ignore:
        case JSDocTagName.reflect:
            return true;

        case JSDocTagName.cssprop:
        case JSDocTagName.cssproperty:
            return {
                name: tag.name ?? '',
                default: tag.default ?? '',
                description: normalizeDescription(tag.description),
            };

        case JSDocTagName.param:
            return {
                name: tag.name ?? '',
                default: tag.default ?? '',
                optional: tag.optional ?? '',
                description: normalizeDescription(tag.description),
            };

        case JSDocTagName.csspart:
        case JSDocTagName.slot:
        case JSDocTagName.attr:
            return {
                name: tag.name ?? '',
                description: normalizeDescription(tag.description),
            };

        case JSDocTagName.fires:
        case JSDocTagName.event:
            return {
                name: tag.name ?? '',
                type: tag.type ?? '',
                description: normalizeDescription(tag.description),
            };

        default:
            if (jsDocHandlers[name] !== undefined) {
                try {
                    return jsDocHandlers[name](tag) ?? '';
                } catch (error: unknown) {
                    logError(`The JSDoc Handler "${name}" has thrown the following error: `, error);
                }
            }

            return tag.name ?? '';
    }
}

function normalizeDescription(desc: string): string {
    if (desc.startsWith('- ')) {
        return desc.slice(2);
    }

    return desc;
}
