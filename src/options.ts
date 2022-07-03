import { Declaration, Module, Parameter } from './models';
import ts from 'typescript';


export interface Plugin {
    name: string;
    handler: (node: ts.SourceFile, moduleDoc: Module, modulesDoc: Module[]) => void;
}

/**
 * Options to add extra functionality while parsing
 */
export interface Options {
    /**
     * You can provide plugins which receive each
     * root node of the AST of a file, the generated metadata
     * for that specific file and the entire metadata from all
     * the files (in case you need to cross-references).
     *
     * Use it to add extra metadata to the one generated.
     */
    plugins: Plugin[];

    /**
     * You can add a handler for a jsDoc tag.
     *
     * Each handler receives the value assigned to the jsDoc
     * and the declaration where it's defined.
     *
     * Use it to add extra metadata to the declaration.
     */
    jsDocHandlers: {[key: string]: (value: string, declaration: Declaration) => void};

    /**
     * You can add a handler for any decorator
     *
     * Each handler receives the parameters supplied to the decorator
     * and the declaration to where it's applied.
     *
     * Use it to add extra metadata to the declaration.
     */
    decoratorHandlers: {[key: string]: (parameters: Parameter, declaration: Declaration) => void};
}
