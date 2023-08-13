import { readExpectedOutput, test, updateExpectedOutput } from '../utils.js';
import { type Module, parseFromSource } from '@ts-ast-parser/core';
import { describe, expect } from 'vitest';

const category = 'from-source';
const expected = readExpectedOutput(category);
const actual = await parseFromSource('const foo = true;export { foo };');

describe(category, () => {
    test('should reflect the expected modules', ({ update }) => {
        const result = actual?.result?.serialize() ?? ({} as Module);

        if (update) {
            updateExpectedOutput(result, category);
            return;
        }

        expect(result).to.deep.equal(expected);
    });
});
