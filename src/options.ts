import { Declaration, Module, Parameter } from './models';
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
     */
    handler: (node: ts.SourceFile, modules: Module[]) => void;
}

/**
 * Options to customize how the metadata is generated
 */
export interface Options {
    /**
     * You can provide plugins which receive a
     * root node of the AST of a file and the entire metadata from all
     * the files (in case you need to cross-references).
     *
     * Use it to add extra metadata to the one generated.
     */
    plugins: Plugin[];

    /**
     * You can add a handler for a jsDoc tag.
     *
     * Each handler receives the value assigned to the jsDoc
     * and the declaration (variable, function, class, property, etc...) where it's defined.
     *
     * Use it to add extra metadata to the declaration.
     */
    jsDocHandlers: {[key: string]: (value: string, declaration: Declaration) => void};

    /**
     * You can add a handler for any decorator
     *
     * Each handler receives the parameters supplied to the decorator
     * and the declaration (function, class, property, etc...) to where it's applied.
     *
     * Use it to add extra metadata to the declaration.
     */
    decoratorHandlers: {[key: string]: (parameters: Parameter[], declaration: Declaration) => void};
}
