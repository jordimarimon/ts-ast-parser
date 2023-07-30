import { parseFromProject } from '@ts-ast-parser/core';
import { readExpectedOutput } from '../../utils.js';
import { describe, expect, it } from 'vitest';
import * as path from 'path';


const category = 'from-project';
const subcategory = 'basic';
const expected = readExpectedOutput(category, subcategory);
const actual = parseFromProject({
    tsConfigFilePath: path.join(process.cwd(), 'tests', category, subcategory, 'test-project', 'tsconfig.json'),
});

describe(category, () => {

    it('should extract the expected metadata', () => {
        const result = actual?.getModules().map(m => m.serialize());
        expect(result).to.deep.equal(expected);
        expect(actual?.getName()).to.equal('test-project');
    });

});
