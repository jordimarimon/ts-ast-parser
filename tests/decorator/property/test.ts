import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'decorator';
const subcategory = 'property';
const {actual, expected} = getFixture({category, subcategory});

describe(`${category}/${subcategory}`, () => {

    it('should reflect the expected modules', () => {
        const result = actual.map(m => m.serialize());
        expect(result).to.deep.equal(expected);
    });

});
