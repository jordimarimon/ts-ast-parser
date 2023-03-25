import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'import';
const subcategory = 'named';
const {actual, expected} = getFixture(category, subcategory, ['foo.ts']);

describe(`${category}/${subcategory}`, () => {

    it('should reflect the expected AST', () => {
        expect(actual.map(m => m.toPOJO())).to.deep.equal(expected);
    });

});
