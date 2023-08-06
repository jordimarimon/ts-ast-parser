import type { DeclarationKind } from './declaration-kind.js';
import type { TypeParameter } from './type-parameter.js';
import type { Parameter } from './parameter.js';
import type { Decorator } from './decorator.js';
import type { JSDoc } from './js-doc.js';
import type { Type } from './type.js';


/**
 * A function return serialized
 */
export interface FunctionReturn {
    type: Type;
}

/**
 * The function signature serialized
 */
export interface FunctionSignature {
    /**
     * The start line number where it's defined
     */
    line?: number;

    /**
     * The array of parameters
     */
    parameters?: readonly Parameter[];

    /**
     * The array of type parameters
     */
    typeParameters?: readonly TypeParameter[];

    /**
     * The signature return type
     */
    return: FunctionReturn;

    /**
     * Any JSDoc comment
     */
    jsDoc?: JSDoc;
}

/**
 * Represents a function-like serialized (function declaration or method declaration)
 */
export interface FunctionLike {
    /**
     * The name of the function
     */
    name: string;

    /**
     * An array of function signatures
     */
    signatures: readonly FunctionSignature[];

    /**
     * The namespace where the function is defined
     */
    namespace?: string;

    /**
     * Whether the function is async or not
     */
    async?: boolean;

    /**
     * Whether it's a generator function or not
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
     */
    generator?: boolean;

    /**
     * Any function decorator
     */
    decorators?: readonly Decorator[];

    /**
     * Any JSDoc comment
     */
    jsDoc?: JSDoc;
}

/**
 * A function declaration after being serialized
 */
export interface FunctionDeclaration extends FunctionLike {
    /**
     * The declaration kind
     */
    kind: DeclarationKind.Function;
}
