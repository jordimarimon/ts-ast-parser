import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'decorator';
const subcategory = 'parameter';
const {actual, expected} = getFixture(category, subcategory);

describe(`${category}/${subcategory}`, () => {

    it.skip('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
