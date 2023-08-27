import { type CommentPart, parse } from '@ts-ast-parser/comment';
import { describe, expect } from 'vitest';
import { test } from '../../utils.js';


const category = 'jsdoc';
const subcategory = 'parser';

describe(`${category}/${subcategory}`, () => {
    test('should allow an empty comment', () => {
        const result = parse('/***/');
        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(0);
    });

    test('should allow a comment with an empty description', () => {
        const result = parse(['/**', ' *', ' */'].join('\n'));
        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(0);
    });

    test('should allow a comment with a description', () => {
        const comment = [
            '/**',
            ' * This is a simple description',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('description');
        expect(result.parts[0]?.text).toEqual('This is a simple description');
    });

    test('should allow one-line comments with a description', () => {
        const result = parse('/** This is a simple description */');

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('description');
        expect(result.parts[0]?.text).toEqual('This is a simple description');
    });

    test('should allow a comment with a multiline description', () => {
        const comment = [
            '/**',
            ' * This is a description that',
            ' * it\'s divided in multiple lines',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('description');
        expect(result.parts[0]?.text).toEqual('This is a description that\nit\'s divided in multiple lines');
    });

    test('should allow a comment with empty lines in the description', () => {
        const comment = [
            '/**',
            ' * This is a description that',
            ' * ', // this is intentionally to test lines with only spaces
            ' *',
            ' * it\'s divided in multiple lines',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('description');
        expect(result.parts[0]?.text).toEqual('This is a description that\nit\'s divided in multiple lines');
    });

    test('should allow a comment with one block tag in the same line', () => {
        const result = parse('/** @function */');

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('function');
    });

    test('should allow a comment with one block tag in a separate line', () => {
        const comment = [
            '/**',
            ' * @required',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('required');
    });

    test('should allow a comment with description and block tags', () => {
        const comment = [
            '/**',
            ' * This is a simple description',
            ' * @function',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(2);
        expect(result.parts[0]?.kind).toEqual('description');
        expect(result.parts[0]?.text).toEqual('This is a simple description');
        expect(result.parts[1]?.kind).toEqual('function');
    });

    test('should allow block tags with only descriptions', () => {
        const comment = [
            '/**',
            ' * @returns This is the description of the tag',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('returns');
        expect(result.parts[0]?.name).toEqual('');
        expect(result.parts[0]?.text).toEqual('This is the description of the tag');
    });

    test('should allow block tags with name and descriptions', () => {
        const comment = [
            '/**',
            ' * @param options This is the description of the options parameter',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('param');
        expect(result.parts[0]?.name).toEqual('options');
        expect(result.parts[0]?.text).toEqual('This is the description of the options parameter');
    });

    test('should allow block tags with name and descriptions separated by a hyphen', () => {
        const comment = [
            '/**',
            ' * @param options - This is the description of the options parameter',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('param');
        expect(result.parts[0]?.name).toEqual('options');
        expect(result.parts[0]?.text).toEqual('This is the description of the options parameter');
    });

    test('should allow block tags with multi line descriptions', () => {
        const comment = [
            '/**',
            ' * @param options - This is the description of the options parameter',
            ' * and it spans in multiple lines',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('param');
        expect(result.parts[0]?.name).toEqual('options');
        expect(result.parts[0]?.text).toEqual('This is the description of the options parameter\nand it spans in multiple lines');
    });

    test('should allow comment descriptions with multiple block tags', () => {
        const comment = [
            '/**',
            ' * This is a simple description',
            ' *',
            ' * @function',
            ' *',
            ' * @param options - This is the description of the options parameter',
            ' * and it spans in multiple lines',
            ' *',
            ' * @returns This function returns some value',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(4);
        expect(result.parts[0]?.kind).toEqual('description');
        expect(result.parts[0]?.text).toEqual('This is a simple description');
        expect(result.parts[1]?.kind).toEqual('function');
        expect(result.parts[2]?.kind).toEqual('param');
        expect(result.parts[2]?.name).toEqual('options');
        expect(result.parts[2]?.text).toEqual('This is the description of the options parameter\nand it spans in multiple lines');
        expect(result.parts[3]?.kind).toEqual('returns');
        expect(result.parts[3]?.text).toEqual('This function returns some value');
    });

    test('should allow a comment with a block tag with a type', () => {
        const comment = [
            '/**',
            ' * @param {Boolean} options - This is the description of the options parameter',
            ' * and it spans in multiple lines',
            ' *',
            ' * @returns {Number} This function returns some value',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(2);
        expect(result.parts[0]?.kind).toEqual('param');
        expect(result.parts[0]?.name).toEqual('options');
        expect(result.parts[0]?.type).toEqual('Boolean');
        expect(result.parts[0]?.text).toEqual('This is the description of the options parameter\nand it spans in multiple lines');
        expect(result.parts[1]?.kind).toEqual('returns');
        expect(result.parts[1]?.type).toEqual('Number');
        expect(result.parts[1]?.text).toEqual('This function returns some value');
    });

    test('should allow a comment with a block tag with optional value', () => {
        const comment = [
            '/**',
            ' * @param {Boolean} [options1] - This is the description of the first options parameter',
            ' * and it spans in multiple lines',
            ' * @param {String} [options2="Hello World"] - This is the description of the second options parameter',
            ' *',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(2);
        expect(result.parts[0]?.kind).toEqual('param');
        expect(result.parts[0]?.name).toEqual('options1');
        expect(result.parts[0]?.type).toEqual('Boolean');
        expect(result.parts[0]?.optional).toEqual(true);
        expect(result.parts[0]?.text).toEqual('This is the description of the first options parameter\nand it spans in multiple lines');
        expect(result.parts[1]?.kind).toEqual('param');
        expect(result.parts[1]?.name).toEqual('options2');
        expect(result.parts[1]?.type).toEqual('String');
        expect(result.parts[1]?.optional).toEqual(true);
        expect(result.parts[1]?.default).toEqual('"Hello World"');
        expect(result.parts[1]?.text).toEqual('This is the description of the second options parameter');
    });

    test('should allow inline tags at the end of the description', () => {
        const comment = [
            '/**',
            ' * This is a description that',
            ' * it\'s divided in multiple lines and includes',
            ' * an inline tag like the following {@link https://www.example.com|Example}',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('description');
        expect(Array.isArray(result.parts[0]?.text)).toBeTruthy();
        expect((result.parts[0]?.text as CommentPart[]).length).toEqual(2);
        expect((result.parts[0]?.text as CommentPart[])[0]?.kind).toEqual('text');
        expect((result.parts[0]?.text as CommentPart[])[0]?.text).toEqual('This is a description that\nit\'s divided in multiple lines and includes\nan inline tag like the following');
        expect((result.parts[0]?.text as CommentPart[])[1]?.kind).toEqual('link');
        expect((result.parts[0]?.text as CommentPart[])[1]?.target).toEqual('https://www.example.com');
        expect((result.parts[0]?.text as CommentPart[])[1]?.targetText).toEqual('Example');
    });

    test('should allow inline tags in between the description', () => {
        const comment = [
            '/**',
            ' * This is a description and ',
            ' * see {@link https://www.example.com|Example} for more information or',
            ' * {@link https://www.google.com | Google} this other link',
            ' */'
        ];
        const result = parse(comment.join('\n'));

        expect(result.error).toEqual(null);
        expect(result.parts.length).toEqual(1);
        expect(result.parts[0]?.kind).toEqual('description');
        expect(Array.isArray(result.parts[0]?.text)).toBeTruthy();
        expect((result.parts[0]?.text as CommentPart[]).length).toEqual(5);
        expect((result.parts[0]?.text as CommentPart[])[0]?.kind).toEqual('text');
        expect((result.parts[0]?.text as CommentPart[])[0]?.text).toEqual('This is a description and\nsee');
        expect((result.parts[0]?.text as CommentPart[])[1]?.kind).toEqual('link');
        expect((result.parts[0]?.text as CommentPart[])[1]?.target).toEqual('https://www.example.com');
        expect((result.parts[0]?.text as CommentPart[])[1]?.targetText).toEqual('Example');
        expect((result.parts[0]?.text as CommentPart[])[2]?.kind).toEqual('text');
        expect((result.parts[0]?.text as CommentPart[])[2]?.text).toEqual('for more information or\n');
        expect((result.parts[0]?.text as CommentPart[])[3]?.kind).toEqual('link');
        expect((result.parts[0]?.text as CommentPart[])[3]?.target).toEqual('https://www.google.com');
        expect((result.parts[0]?.text as CommentPart[])[3]?.targetText).toEqual('Google');
        expect((result.parts[0]?.text as CommentPart[])[4]?.kind).toEqual('text');
        expect((result.parts[0]?.text as CommentPart[])[4]?.text).toEqual('this other link');
    });
});
