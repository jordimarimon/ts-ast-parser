import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils';


const category = 'enum';
const subcategory = 'basic';
const {actual, expected} = getFixture(category, subcategory);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
