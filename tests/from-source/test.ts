import { parseFromSource } from '@ts-ast-parser/core';
import { readExpectedOutput } from '../utils.js';
import { describe, expect, it } from 'vitest';

const category = 'from-source';
const expected = readExpectedOutput(category);
const actual = await parseFromSource('const foo = true;export { foo };');

describe(category, () => {
    it('should reflect the expected modules', () => {
        expect(actual?.result?.serialize()).to.deep.equal(expected);
    });
});
