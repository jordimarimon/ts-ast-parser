import { getTestResult, test, updateExpectedOutput } from '../../utils.js';
import { describe, expect } from 'vitest';
import * as path from 'path';


const category = 'import';
const subcategory = 'paths';
const compilerOptions = {
    baseUrl: path.join(process.cwd(), 'tests', category, subcategory),
    experimentalDecorators: true,
    target: 'es2020',
    module: 'ES2020',
    lib: ['es2020'],
    paths: {
        'custom-path/foo': ['./foo.ts'],
    },
};
const { actual, expected } = await getTestResult({ category, subcategory, analyzerOptions: { compilerOptions } });

describe(`${category}/${subcategory}`, () => {
    test('should reflect the expected modules', ({ update }) => {
        const result = actual.map(m => m.serialize());

        if (update) {
            updateExpectedOutput(result, category, subcategory);
            return;
        }

        expect(result).to.deep.equal(expected);
    });
});
