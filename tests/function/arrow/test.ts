import { getTestResult } from '../../utils.js';
import { describe, expect, it } from 'vitest';

const category = 'function';
const subcategory = 'arrow';
const { actual, expected } = await getTestResult({ category, subcategory });

describe(`${category}/${subcategory}`, () => {
    it('should reflect the expected modules', () => {
        const result = actual.map(m => m.serialize());
        expect(result).to.deep.equal(expected);
    });
});
