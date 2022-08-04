import { describe, it, expect } from 'vitest';
import { getFixture } from '../../utils';


const category = 'variable';
const subcategory = 'complex-types';
const {actual, expected} = getFixture(category, subcategory);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
