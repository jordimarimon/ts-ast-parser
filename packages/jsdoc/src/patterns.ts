import { TokenKind } from './token.js';


/**
 * The patterns associated with each token:
 *
 * - The text that matches the token
 * - Whether the token supports multiple consecutive pattern matches
 * - The kind of token
 */
export interface TokenPattern {
    text: string;
    multiple: boolean;
    kind: TokenKind;
}

const ascii = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A',
    'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1',
    '2', '3', '4', '5', '6', '7', '8', '9', '_',
];

// The following characters are treated as "Other":
// '!', '$', '%', '&', "'", '(', ')', '+', ',', '-', '/', ';', '<', '=', '>', '?', '[', ']', '^'

export const patterns: TokenPattern[] = [
    {
        text: '/**',
        kind: TokenKind.StartOfInput,
        multiple: false,
    },

    {
        text: ' */',
        kind: TokenKind.EndOfInput,
        multiple: false,
    },

    {
        text: '*/',
        kind: TokenKind.EndOfInput,
        multiple: false,
    },

    {
        text: '\r\n',
        kind: TokenKind.Newline,
        multiple: false,
    },

    {
        text: '\n',
        kind: TokenKind.Newline,
        multiple: false,
    },

    {
        text: '\r',
        kind: TokenKind.Newline,
        multiple: false,
    },

    {
        text: ' ',
        kind: TokenKind.Spacing,
        multiple: true,
    },

    {
        text: '\t',
        kind: TokenKind.Spacing,
        multiple: true,
    },

    {
        text: '\f',
        kind: TokenKind.Spacing,
        multiple: true,
    },

    {
        text: '*',
        kind: TokenKind.Star,
        multiple: false,
    },

    ...ascii.map(char => ({
        text: char,
        kind: TokenKind.AsciiWord,
        multiple: true,
    })),

    {
        text: '#',
        kind: TokenKind.PoundSymbol,
        multiple: false,
    },

    {
        text: '"',
        kind: TokenKind.DoubleQuote,
        multiple: false,
    },

    {
        text: '.',
        kind: TokenKind.Period,
        multiple: false,
    },

    {
        text: '@',
        kind: TokenKind.AtSign,
        multiple: false,
    },

    {
        text: '`',
        kind: TokenKind.Backtick,
        multiple: false,
    },

    {
        text: '{',
        kind: TokenKind.LeftCurlyBracket,
        multiple: false,
    },

    {
        text: '|',
        kind: TokenKind.Pipe,
        multiple: false,
    },

    {
        text: '}',
        kind: TokenKind.RightCurlyBracket,
        multiple: false,
    },

    {
        text: '~',
        kind: TokenKind.Tilde,
        multiple: false,
    },

    {
        text: ':',
        kind: TokenKind.Colon,
        multiple: false,
    },

    {
        text: '\\',
        kind: TokenKind.Backslash,
        multiple: false,
    },
];
