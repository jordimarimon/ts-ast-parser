import { parseFromProject } from '@ts-ast-parser/core';
import { readExpectedOutput } from '../../utils.js';
import { describe, expect, it } from 'vitest';
import * as path from 'path';

const category = 'from-project';
const subcategory = 'basic';
const expected = readExpectedOutput(category, subcategory);
const actual = await parseFromProject({
    tsConfigFilePath: path.join(process.cwd(), 'tests', category, subcategory, 'test-project', 'tsconfig.json'),
});

describe(category, () => {
    it('should reflect the expected modules', () => {
        const result = actual?.result?.getModules().map(m => m.serialize());
        expect(result).to.deep.equal(expected);
        expect(actual?.result?.getName()).to.equal('test-project');
    });
});
