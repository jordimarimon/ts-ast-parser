import { Token, TokenKind } from './token.js';
import { patterns } from './patterns.js';


/**
 * Lexical analyser for JSDoc comments.
 */
export class DocScanner {

    /**
     * The line number where we currently are
     */
    private _line = 0;

    /**
     * The cursor position inside the line where we are
     */
    private _pos = 0;

    /**
     * The position of the start of the current line
     */
    private _startLine = 0;

    /**
     * The current line tokens
     */
    private _lineTokens: Token[] = [];

    /**
     * The raw JSDoc comment
     */
    private readonly _text: string;

    constructor(text: string) {
        this._text = text.trim();
    }

    get line(): number {
        return this._line;
    }

    get position(): number {
        return this._pos;
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    *lines(): Generator<Token[], void> {
        const end = this._text.length;

        this._pos = 0;

        let previousToken: Token | null = null;

        while (this._pos < end) {
            let token = this._match();

            // This should never happen, and if it does, we have a bug in the lexical analysis
            if (!token) {
                throw new Error(`Found unexpected character at line ${this._line} in position ${this._pos} in the JSDoc comment.`);
            }

            // Check that the comment starts with the correct token
            if (this._pos === 0 && token.kind !== TokenKind.StartOfInput) {
                throw new Error(`Expected the JSDoc comment to start with "/**" but instead found "${token.toString()}".`);
            }

            // Check that every line starts with the correct token
            if (
                !this._lineTokens.length &&
                ![TokenKind.StartOfInput, TokenKind.Spacing, TokenKind.EndOfInput].includes(token.kind)
            ) {
                throw new Error(`Unexpected character at the start of the line in the JSDoc comment: "${token.toString()}".`);
            }

            this._pos += token.length;

            // Append to the previous token if they're of the same kind and
            // the token accepts multiple symbols
            if (previousToken && previousToken.multiple && token.kind === previousToken.kind) {
                previousToken.merge(token);
                token = previousToken;
            } else {
                this._lineTokens.push(token);
                previousToken = token;
            }

            if (token.kind === TokenKind.Newline || token.kind === TokenKind.EndOfInput) {
                yield [...this._lineTokens];

                this._line++;
                this._lineTokens = [];
                this._startLine = this._pos + 1;
            }
        }

        // Make sure the comment is closed
        if (this._lineTokens.length > 0) {
            const lastToken = this._lineTokens[this._lineTokens.length - 1];
            throw new Error(`Expected the JSDoc comment to end with "*/" but instead found "${lastToken?.toString() ?? ''}".`);
        }
    }

    private _match(): Token {
        const startOfLine = this._pos - this._startLine;

        let token: Token | null = null;

        for (const pattern of patterns) {
            const end = this._pos + pattern.text.length;
            const lexeme = this._text.slice(this._pos, end);

            if (lexeme === pattern.text) {
                token = new Token(
                    pattern.kind,
                    lexeme,
                    pattern.multiple,
                    this._line,
                    startOfLine,
                    end - this._startLine,
                );
                break;
            }
        }

        if (!token) {
            return new Token(
                TokenKind.Other,
                this._text[this._pos] ?? '',
                false,
                this._line,
                startOfLine,
                this._pos + 1,
            );
        }

        return token;
    }

}
