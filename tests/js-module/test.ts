import { readExpectedOutput, test, updateExpectedOutput } from '../utils.js';
import { parseFromFiles } from '@ts-ast-parser/core';
import { describe, expect } from 'vitest';
import * as path from 'node:path';


const category = 'js-module';
const expected = readExpectedOutput(category);
const actual = await parseFromFiles([path.join(process.cwd(), 'tests', category, 'index.js')], {jsProject: true});

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
