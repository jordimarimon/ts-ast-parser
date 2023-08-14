import { readExpectedOutput, test, updateExpectedOutput } from '../../utils.js';
import { parseFromProject } from '@ts-ast-parser/core';
import { describe, expect } from 'vitest';
import * as path from 'path';


const category = 'from-project';
const subcategory = 'basic';
const expected = readExpectedOutput(category, subcategory);
const actual = await parseFromProject({
    tsConfigFilePath: path.join(process.cwd(), 'tests', category, subcategory, 'test-project', 'tsconfig.json'),
});

describe(category, () => {
    test('should reflect the expected modules', ({ update }) => {
        const result = actual.result?.getModules().map(m => m.serialize()) ?? [];

        if (update) {
            updateExpectedOutput(result, category, subcategory);
            return;
        }

        expect(result).to.deep.equal(expected);
        expect(actual.result?.getName()).to.equal('test-project');
    });
});
