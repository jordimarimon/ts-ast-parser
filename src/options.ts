import { Declaration, Module, Parameter } from './models';
import ts from 'typescript';


/**
 * Options to add functionality while parsing
 */
export interface Options {
    /**
     * You can provide plugins which receive each
     * node of the AST and the generated metadata.
     *
     * Use it to add extra metadata to the one generated.
     */
    plugins: ((node: ts.Node, modulesDoc: Module[]) => void)[];

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
