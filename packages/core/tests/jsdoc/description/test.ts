import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'jsdoc';
const subcategory = 'description';
const {actual, expected} = getFixture(category, subcategory);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});