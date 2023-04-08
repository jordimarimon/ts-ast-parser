import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'import';
const subcategory = 'default';
const {actual, expected} = getFixture(category, subcategory, ['foo.ts']);

describe(`${category}/${subcategory}`, () => {

    it('should reflect the expected AST', () => {
        const snapshot = actual.map(m => m.toPOJO());
        expect(snapshot).to.deep.equal(expected);
    });

});
