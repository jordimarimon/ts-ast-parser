import { Reader } from '@ts-ast-parser/readers';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'export';
const subcategory = 'star';
const {actual, expected} = getFixture(category, subcategory, ['foo.ts']);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have one module', () => {
        expect(reader.getAll().length).to.equal(2);
    });

});
