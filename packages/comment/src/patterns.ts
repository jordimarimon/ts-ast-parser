import { TokenKind } from './token.js';


/**
 * The pattern associated with a token
 */
export interface TokenPattern {
    /** Whether the token supports multiple consecutive pattern matches */
    multiple: boolean;

    /** The kind of token */
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

const spacing = [' ', '\t', '\f'];

export const patterns: Record<number, TokenPattern> = {

    ['/'.charCodeAt(0)]: {
        kind: TokenKind.Slash,
        multiple: false,
    },

    ['*'.charCodeAt(0)]: {
        kind: TokenKind.Star,
        multiple: false,
    },

    ['#'.charCodeAt(0)]: {
        kind: TokenKind.PoundSymbol,
        multiple: false,
    },

    ['"'.charCodeAt(0)]: {
        kind: TokenKind.DoubleQuote,
        multiple: false,
    },

    ['.'.charCodeAt(0)]: {
        kind: TokenKind.Period,
        multiple: false,
    },

    ['@'.charCodeAt(0)]: {
        kind: TokenKind.AtSign,
        multiple: false,
    },

    ['`'.charCodeAt(0)]: {
        kind: TokenKind.Backtick,
        multiple: false,
    },

    ['{'.charCodeAt(0)]: {
        kind: TokenKind.LeftCurlyBracket,
        multiple: false,
    },

    ['}'.charCodeAt(0)]: {
        kind: TokenKind.RightCurlyBracket,
        multiple: false,
    },

    ['|'.charCodeAt(0)]: {
        kind: TokenKind.Pipe,
        multiple: false,
    },

    ['~'.charCodeAt(0)]: {
        kind: TokenKind.Tilde,
        multiple: false,
    },

    [':'.charCodeAt(0)]: {
        kind: TokenKind.Colon,
        multiple: false,
    },

    ['='.charCodeAt(0)]: {
        kind: TokenKind.Equal,
        multiple: false,
    },

    ['['.charCodeAt(0)]: {
        kind: TokenKind.LeftSquareBracket,
        multiple: false,
    },

    [']'.charCodeAt(0)]: {
        kind: TokenKind.RightSquareBracket,
        multiple: false,
    },

    ['-'.charCodeAt(0)]: {
        kind: TokenKind.Hyphen,
        multiple: false,
    },

    ['\\'.charCodeAt(0)]: {
        kind: TokenKind.Backslash,
        multiple: false,
    },

    ['\n'.charCodeAt(0)]: {
        kind: TokenKind.Newline,
        multiple: false,
    },

    ...ascii.reduce<Record<number, TokenPattern>>((acc, char) => {
        acc[char.charCodeAt(0)] = {kind: TokenKind.AsciiWord, multiple: true};
        return acc;
    }, {}),

    ...spacing.reduce<Record<number, TokenPattern>>((acc, char) => {
        acc[char.charCodeAt(0)] = {kind: TokenKind.Spaces, multiple: true};
        return acc;
    }, {}),

};
