import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'function';
const subcategory = 'const-type-parameters';
const {actual, expected} = getFixture({category, subcategory});

describe(`${category}/${subcategory}`, () => {

    it('should reflect the expected modules', () => {
        const result = actual.map(m => m.serialize());
        expect(result).to.deep.equal(expected);
    });

});
