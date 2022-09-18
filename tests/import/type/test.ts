import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'import';
const subcategory = 'type';
const {actual, expected} = getFixture(category, subcategory, ['type-a.ts']);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
