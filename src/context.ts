import { Options } from './options';
import ts from 'typescript';


export interface ParserContext {
    checker: ts.TypeChecker | null;
    options: Partial<Options>;
}

/**
 * We define a context to be shared with all the functions.
 *
 * Context is defined only at the start of the parsing by the `parseFrom*` functions.
 */
export const Context: ParserContext = {

    checker: null,

    options: {},

};
