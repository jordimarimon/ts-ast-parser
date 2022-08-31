import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'with-options';
const subcategory = 'plugin';
const {actual, expected} = getFixture(category, subcategory);

describe(`${category}/${subcategory}`, () => {

    it.skip('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
