import { describe, expect, it } from 'vitest';
import { getTestResult } from '../../utils.js';
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
const {actual, expected} = await getTestResult({category, subcategory, analyzerOptions: {compilerOptions}});

describe(`${category}/${subcategory}`, () => {

    it('should reflect the expected modules', () => {
        const result = actual.map(m => m.serialize());
        expect(result).to.deep.equal(expected);
    });

});
