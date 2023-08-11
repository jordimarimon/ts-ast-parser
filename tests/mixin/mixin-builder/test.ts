import { describe, expect, it } from 'vitest';
import { getTestResult } from '../../utils.js';


const category = 'mixin';
const subcategory = 'mixin-builder';
const {actual, expected} = await getTestResult({category, subcategory});

describe(`${category}/${subcategory}`, () => {

    it.skip('should reflect the expected modules', () => {
        const result = actual.map(m => m.serialize());
        expect(result).to.deep.equal(expected);
    });

});
