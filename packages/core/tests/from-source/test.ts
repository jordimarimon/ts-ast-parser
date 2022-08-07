import { parseFromSource } from '../../src/index.js';
import { readExpectedOutput } from '../utils.js';
import { describe, expect, it } from 'vitest';


const category = 'from-source';
const expected = readExpectedOutput(category);
const source = 'const foo = true;export { foo };';
const actual = parseFromSource(source);

describe(category, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
