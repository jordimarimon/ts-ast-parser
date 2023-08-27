import { TokenKind, tokens } from '@ts-ast-parser/comment';
import { describe, expect } from 'vitest';
import { test } from '../../utils.js';


const category = 'jsdoc';
const subcategory = 'scanner';

describe(`${category}/${subcategory}`, () => {
    test('should allow an empty comment', () => {
        const expected = [
            TokenKind.Slash,
            TokenKind.Star,
            TokenKind.Star,
            TokenKind.Star,
            TokenKind.Slash,
        ];

        const actual: TokenKind[] = [];
        for (const token of tokens('/***/')) {
            actual.push(token.kind);
        }

        expect(actual).toEqual(expected);
    });

    test('should allow an empty comment with new lines', () => {
        const expected = [
            TokenKind.Slash,
            TokenKind.Star,
            TokenKind.Star,
            TokenKind.Newline,
            TokenKind.Spaces,
            TokenKind.Star,
            TokenKind.Newline,
            TokenKind.Spaces,
            TokenKind.Star,
            TokenKind.Slash,
        ];

        const actual: TokenKind[] = [];
        for (const token of tokens(['/**', ' *', ' */'].join('\n'))) {
            actual.push(token.kind);
        }

        expect(actual).toEqual(expected);
    });

    test('should allow a comment with general characters', () => {
        const text = [
            '/**',
            ' * "~@{|}`.:#\\abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
            ' */',
        ];
        const expected = [
            TokenKind.Slash,
            TokenKind.Star,
            TokenKind.Star,
            TokenKind.Newline,

            TokenKind.Spaces,
            TokenKind.Star,
            TokenKind.Spaces,
            TokenKind.DoubleQuote,
            TokenKind.Tilde,
            TokenKind.AtSign,
            TokenKind.LeftCurlyBracket,
            TokenKind.Pipe,
            TokenKind.RightCurlyBracket,
            TokenKind.Backtick,
            TokenKind.Period,
            TokenKind.Colon,
            TokenKind.PoundSymbol,
            TokenKind.Backslash,
            TokenKind.AsciiWord,
            TokenKind.Newline,

            TokenKind.Spaces,
            TokenKind.Star,
            TokenKind.Slash,
        ];

        const actual: TokenKind[] = [];
        for (const token of tokens(text.join('\n'))) {
            actual.push(token.kind);
        }

        expect(actual).toEqual(expected);
    });

    test('should allow a comment with spacing characters', () => {
        const text = ['/**', ' * space:  tab: \t  form feed: \f end', ' */'].join('\n');
        const expected = [
            TokenKind.Slash,
            TokenKind.Star,
            TokenKind.Star,
            TokenKind.Newline,

            TokenKind.Spaces,
            TokenKind.Star,
            TokenKind.Spaces,
            TokenKind.AsciiWord,
            TokenKind.Colon,
            TokenKind.Spaces,
            TokenKind.AsciiWord,
            TokenKind.Colon,
            TokenKind.Spaces,
            TokenKind.AsciiWord,
            TokenKind.Spaces,
            TokenKind.AsciiWord,
            TokenKind.Colon,
            TokenKind.Spaces,
            TokenKind.AsciiWord,
            TokenKind.Newline,

            TokenKind.Spaces,
            TokenKind.Star,
            TokenKind.Slash,
        ];

        const actual: TokenKind[] = [];
        for (const token of tokens(text)) {
            actual.push(token.kind);
        }

        expect(actual).toEqual(expected);
    });
});
