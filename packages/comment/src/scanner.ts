import { Token, TokenKind } from './token.js';
import { patterns } from './patterns.js';


/**
 * Lexical analyser
 *
 * @param text - The raw comment to analyse
 *
 * @yields The next token
 */
export function *tokens(text: string): Generator<Token, void> {
    // We transform the text to work only with the NL character
    const normalizedText = text.trim().replace(/\r\n/g, '\n');
    const end = normalizedText.length;

    let pos = 0;
    let line = 0;
    let startOfLine = 0;

    let lineTokens: Token[] = []; // Tokens of the current line
    let currentToken: Token | null = null;
    let previousToken: Token | null = null;

    while (pos < end) {
        const code = normalizedText.charCodeAt(pos);
        const char = normalizedText[pos] as string;
        const pattern = patterns[code];
        const start = pos - startOfLine;

        if (pattern !== undefined) {
            currentToken = new Token(
                pattern.kind,
                char,
                pattern.multiple,
                line,
                start,
                start + 1,
            );
        } else {
            currentToken = new Token(
                TokenKind.Other,
                char,
                true,
                line,
                start,
                start + 1,
            );
        }

        pos += currentToken.length;

        // Append to the previous token if they're of the same kind and
        // the token accepts multiple symbols
        if (previousToken && previousToken.multiple && currentToken.kind === previousToken.kind) {
            previousToken.merge(currentToken);
            currentToken = previousToken;
        } else {
            if (previousToken) {
                yield previousToken;
            }

            lineTokens.push(currentToken);
            previousToken = currentToken;
        }

        if (currentToken.kind === TokenKind.Newline) {
            line++;
            startOfLine = pos + 1;
            lineTokens = [];
        }

        if (isEndOfInput(lineTokens)) {
            yield previousToken;
            break;
        }
    }
}

function isEndOfInput(lineTokens: Token[]): boolean {
    const n = lineTokens.length;
    return lineTokens[n - 1]?.kind === TokenKind.Slash && lineTokens[n - 2]?.kind === TokenKind.Star;
}
