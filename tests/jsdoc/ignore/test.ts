import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'jsdoc';
const subcategory = 'ignore';
const {actual, expected} = getFixture({category, subcategory});

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        const result = actual.map(m => m.toPOJO());
        expect(result).to.deep.equal(expected);
    });

});
