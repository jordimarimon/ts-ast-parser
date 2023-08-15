import { readExpectedOutput, test, updateExpectedOutput } from '../utils.js';
import { parseFromGlob } from '@ts-ast-parser/core';
import { describe, expect } from 'vitest';
import path from 'path';


const category = 'from-glob';
const expected = readExpectedOutput(category);
const actual = await parseFromGlob(path.join(process.cwd(), 'tests', category, 'index.ts'));

describe(category, () => {
    test('should reflect the expected modules', ({ update }) => {
        const result = actual.project?.getModules().map(m => m.serialize()) ?? [];

        if (update) {
            updateExpectedOutput(result, category);
            return;
        }

        expect(result).to.deep.equal(expected);
    });
});
