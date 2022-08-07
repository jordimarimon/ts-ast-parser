import { parseFromGlob } from '../../src/index.js';
import { readExpectedOutput } from '../utils.js';
import { describe, expect, it } from 'vitest';
import path from 'path';


const category = 'from-glob';
const pattern = path.join('packages', 'core', 'tests', category, 'index.ts');
const expected = readExpectedOutput(category);
const actual = parseFromGlob(pattern);

describe(category, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

});
