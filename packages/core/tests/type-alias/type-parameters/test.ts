import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils';


const category = 'type-alias';
const subcategory = 'type-parameters';
const {actual, expected} = getFixture(category, subcategory);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
