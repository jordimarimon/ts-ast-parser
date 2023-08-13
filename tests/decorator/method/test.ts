import { getTestResult, test, updateExpectedOutput } from '../../utils.js';
import { describe, expect } from 'vitest';

const category = 'decorator';
const subcategory = 'method';
const { actual, expected } = await getTestResult({ category, subcategory });

describe(`${category}/${subcategory}`, () => {
    test('should reflect the expected modules', ({ update }) => {
        const result = actual.map(m => m.serialize());

        if (update) {
            updateExpectedOutput(result, category, subcategory);
            return;
        }

        expect(result).to.deep.equal(expected);
    });
});
