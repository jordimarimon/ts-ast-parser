import { DocScanner, TokenKind } from '@ts-ast-parser/jsdoc';
import { describe, expect } from 'vitest';
import { test } from '../../utils.js';


const category = 'jsdoc';
const subcategory = 'scanner';

describe(`${category}/${subcategory}`, () => {
    test('empty comment', () => {
        const scanner = new DocScanner('/***/');
        const expected = [
            TokenKind.StartOfInput,
            TokenKind.EndOfInput,
        ];

        const actual: TokenKind[] = [];
        for (const line of scanner.lines()) {
            actual.push(...line.map(token => token.kind));
        }

        expect(actual).toEqual(expected);
    });

    test('empty comment with new lines', () => {
        const scanner = new DocScanner(['/**', ' *', ' */'].join('\n'));
        const expected = [
            TokenKind.StartOfInput,
            TokenKind.Newline,
            TokenKind.Spacing,
            TokenKind.Star,
            TokenKind.Newline,
            TokenKind.EndOfInput,
        ];

        const actual: TokenKind[] = [];
        for (const line of scanner.lines()) {
            actual.push(...line.map(token => token.kind));
        }

        expect(actual).toEqual(expected);
    });

    test('general characters', () => {
        const text = [
            '/**',
            ' * "~@{|}`.:#\\abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
            ' */',
        ];
        const scanner = new DocScanner(text.join('\n'));
        const expected = [
            TokenKind.StartOfInput,
            TokenKind.Newline,

            TokenKind.Spacing,
            TokenKind.Star,
            TokenKind.Spacing,
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

            TokenKind.EndOfInput,
        ];

        const actual: TokenKind[] = [];
        for (const line of scanner.lines()) {
            actual.push(...line.map(token => token.kind));
        }

        expect(actual).toEqual(expected);
    });

    test('spacing characters', () => {
        const scanner = new DocScanner(['/**', ' * space:  tab: \t  form feed: \f end', ' */'].join('\n'));
        const expected = [
            TokenKind.StartOfInput,
            TokenKind.Newline,

            TokenKind.Spacing,
            TokenKind.Star,
            TokenKind.Spacing,
            TokenKind.AsciiWord,
            TokenKind.Colon,
            TokenKind.Spacing,
            TokenKind.AsciiWord,
            TokenKind.Colon,
            TokenKind.Spacing,
            TokenKind.AsciiWord,
            TokenKind.Spacing,
            TokenKind.AsciiWord,
            TokenKind.Colon,
            TokenKind.Spacing,
            TokenKind.AsciiWord,
            TokenKind.Newline,

            TokenKind.EndOfInput,
        ];

        const actual: TokenKind[] = [];
        for (const line of scanner.lines()) {
            actual.push(...line.map(token => token.kind));
        }

        expect(actual).toEqual(expected);
    });
});
