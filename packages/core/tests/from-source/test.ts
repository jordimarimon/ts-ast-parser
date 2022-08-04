import { readExpectedOutput } from '../utils';
import { describe, expect, it } from 'vitest';
import { parseFromSource } from '../../src';


const category = 'from-source';
const expected = readExpectedOutput(category);
const source = `const foo = true;export { foo };`;
const actual = parseFromSource(source);

describe(category, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
