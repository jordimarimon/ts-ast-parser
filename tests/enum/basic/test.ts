import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'enum';
const subcategory = 'basic';
const {actual, expected} = getFixture({category, subcategory});

describe(`${category}/${subcategory}`, () => {

    it('should reflect the expected AST', () => {
        const result = actual.map(m => m.toPOJO());
        expect(result).to.deep.equal(expected);
    });

});
