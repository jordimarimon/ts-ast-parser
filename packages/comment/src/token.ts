/**
 * Distinguishes different types of Token objects.
 */
export enum TokenKind {
    /**
     * A token representing a newline -> "\n" or "\r\n"
     */
    Newline,

    /**
     * A token representing one or more spaces and/or tabs (but not newlines).
     */
    Spaces,

    /**
     * A token representing one or more ASCII letters, numbers, and/or underscores.
     */
    AsciiWord,

    /**
     * The slash character `/`
     */
    Slash,

    /**
     * The star character `*`.
     */
    Star,

    /**
     * The backslash character `\`. Can be used to escape characters.
     */
    Backslash,

    /**
     * The double-quote character `"`. Double quotes can be used to
     * surround unusual characters (similar to escaping them).
     */
    DoubleQuote,

    /**
     * The tilde character `~`. Can be used to reference inner members in links.
     */
    Tilde,

    /**
     * The at-sign character `@`.
     */
    AtSign,

    /**
     * The left curly bracket character `{`.
     */
    LeftCurlyBracket,

    /**
     * The right curly bracket character `}`.
     */
    RightCurlyBracket,

    /**
     * The backtick character. Can be used to include code snippets.
     */
    Backtick,

    /**
     * The period character `.`. Can be used to reference static members.
     */
    Period,

    /**
     * The colon character `:`. Can be used to reference external symbols.
     */
    Colon,

    /**
     * The pipe character `|`. Can be used to define the link text.
     */
    Pipe,

    /**
     * The pound character `#`. Can be used to define instance members in links.
     */
    PoundSymbol,

    /**
     * The right square bracket character `]`. Can be used when defining
     * the default value.
     */
    RightSquareBracket,

    /**
     * The left square bracket character `[`. Can be used when defining
     * the default value.
     */
    LeftSquareBracket,

    /**
     * The equal character `=`. Can be used when defining the default value.
     */
    Equal,

    /**
     * The hyphen character `-`. Can be used to separate the name from the description.
     */
    Hyphen,

    /**
     * A token representing any other character not present in the above tokens.
     */
    Other,
}

/**
 * A sequence of characters that are treated as a unit as it cannot be further
 * broken down.
 */
export class Token {

    /**
     * The kind of token
     */
    private readonly _kind: TokenKind;

    /**
     * Whether this token can be merged with continuous tokens of the same kind
     */
    private readonly _multiple: boolean;

    /**
     * The starting index into the associated text.
     */
    private readonly _start: number;

    /**
     * The doc comment "line" number that this Token was extracted from.
     */
    private readonly _line: number;

    /**
     * The sequence of characters in the source code
     * that matched the pattern associated with the token.
     */
    private _lexeme: string;

    /**
     * The (non-inclusive) ending index into the associated text.
     */
    private _end: number;

    constructor(
        kind: TokenKind,
        lexeme: string,
        multiple: boolean,
        line: number,
        start: number,
        end: number,
    ) {
        this._kind = kind;
        this._lexeme = lexeme;
        this._multiple = multiple;
        this._line = line;
        this._start = start;
        this._end = end;
    }

    get kind(): TokenKind {
        return this._kind;
    }

    get start(): number {
        return this._start;
    }

    get end(): number {
        return this._end;
    }

    get line(): number {
        return this._line;
    }

    get length(): number {
        return this._end - this._start;
    }

    get multiple(): boolean {
        return this._multiple;
    }

    merge(token: Token): void {
        this._end = token.end;
        this._lexeme = `${this._lexeme}${token.toString()}`;
    }

    toString(): string {
        return this._lexeme;
    }

}
