import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'jsdoc';
const subcategory = 'description';
const {actual, expected} = getFixture({category, subcategory});

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        const result = actual.map(m => m.serialize());
        expect(result).to.deep.equal(expected);
    });

});