import { parseFromGlob } from '@ts-ast-parser/core';
import { readExpectedOutput } from '../utils.js';
import { describe, expect, it } from 'vitest';
import path from 'path';


const category = 'from-glob';
const pattern = path.join(process.cwd(), 'tests', category, 'index.ts');
const expected = readExpectedOutput(category);
const actual = parseFromGlob(pattern);

describe(category, () => {

    it('should reflect the expected modules', () => {
        const result = actual.map(m => m.serialize());
        expect(result).to.deep.equal(expected);
    });

});
