import type { Token } from './token.js';


/**
 * A non-terminal element that is part of the grammar
 * after being serialized
 */
export interface CommentPart {
    /**
     * The name of the block tag or "description" if it's the description of the comment
     */
    kind?: string;

    /**
     * If there is any type defined in the block tag
     */
    type?: string;

    /**
     * If there is any name defined in the block tag
     */
    name?: string;

    /**
     * Whether the block tag is a modifier (only has the tag "kind" defined)
     */
    modifier?: boolean;

    /**
     * The default value defined in the block tag -> [name=default]
     */
    default?: string;

    /**
     * If it's optional
     */
    optional?: boolean;

    /**
     * The description text
     */
    text?: string | CommentPart[];

    /**
     * Indicates which symbol/url it links to.
     */
    target?: string;

    /**
     * Text that should be displayed as the link text
     */
    targetText?: string;
}

/**
 * Represents an error thrown by the parser
 */
export interface ParserError {
    message: string;
    line: number;
    start: number;
    end: number;
}

/**
 * The status of a symbol during the parsing phase.
 *
 * - "in-progress": Means that the symbol still accepts more tokens.
 * - "success": Means that the symbol is valid, and it doesn't accept more tokens.
 * - "error": Means that the symbol is not valid, and it doesn't accept more tokens.
 * - "backtrack": Means that the symbol may or may not be valid, but some tokens that were read,
 *                aren't part of the symbol and should be evaluated with the next symbols in the grammar.
 *                It doesn't accept more tokens.
 */
export type ParserStatus = {kind: 'in-progress'}
    | {kind: 'backtrack'; tokens: Token[]}
    | {kind: 'success'}
    | {kind: 'error'; error: ParserError};

/**
 * The return value after parsing a comment
 */
export interface ParserResult {
    error: ParserError | null;
    parts: CommentPart[];
}

/**
 * Defines the production rule of a symbol in the grammar
 */
export interface ParserSymbol {
    /**
     * Analyses the next token
     *
     * @returns The current status of the symbol
     */
    next(token: Token): ParserStatus;

    /**
     * Whether the symbol is valid or not.
     *
     * A valid symbol is one that produces a non-empty
     * serializable object.
     */
    isValid(): boolean;

    /**
     * Returns a serializable object of the right
     * hand side of the production rule.
     */
    serialize(): CommentPart[];
}
