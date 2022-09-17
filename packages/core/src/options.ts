import { Spec } from 'comment-parser/primitives';


export interface Options {
    /**
     * You can add a handler for a jsDoc tag.
     *
     * Each handler receives the jsDoc tag parsed.
     *
     * Use it to add extra metadata to the declaration where the JSDoc was defined.
     */
    jsDocHandlers: JSDocHandlers;
}

export type JSDocHandlers = {
    [key: string]: (tag: Spec) => unknown;
};
