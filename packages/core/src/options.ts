import { Spec } from 'comment-parser/primitives';
import { Module } from './models/index.js';
import ts from 'typescript';


/**
 * A plugin can be used to customize the output metadata generated.
 */
export interface Plugin {
    /**
     * A name to identify the plugin in case there is an error.
     */
    name: string;

    /**
     * A callback function that can be used to add custom
     * metadata to a specific source file.
     *
     * You need to modify the metadata in place.
     *
     * @param node - The TypeScript AST root node of the source file
     * @param modules - The entire metadata from all the files (in case you need to cross-references).
     * @param checker - The TS Compiler Type Checker
     */
    handler: (node: ts.SourceFile | undefined, modules: Module[], checker: ts.TypeChecker | null) => void;
}

/**
 * Options to customize how the metadata is generated
 */
export interface Options {
    /**
     * You can provide plugins to add extra metadata to the one generated.
     */
    plugins: Plugin[];

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
