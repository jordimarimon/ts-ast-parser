import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'variable';
const subcategory = 'imported-initializer';
const {actual, expected} = getFixture(category, subcategory, ['foo.ts']);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
