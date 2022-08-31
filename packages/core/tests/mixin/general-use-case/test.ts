import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'mixin';
const subcategory = 'general-use-case';
const {actual, expected} = getFixture(category, subcategory);

describe(`${category}/${subcategory}`, () => {

    it.skip('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
