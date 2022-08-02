import { parseFromFiles, Options } from '../src';
import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';

////////////////////////////////////////////////
// TESTS FLAGS
////////////////////////////////////////////////

const CATEGORY = 'function';
const SUBCATEGORY = 'async';
const DEV = true; // Logs to console
const ASSERT = false;
const WITH_USER_DEFINED_OPTIONS = false;

// TODO(Jordi M.): Define some options to test
const USER_OPTIONS: Partial<Options> = WITH_USER_DEFINED_OPTIONS ? {} : {};


////////////////////////////////////////////////
/// TESTS
////////////////////////////////////////////////

const {pathname: cwd} = new URL('..', import.meta.url);

const categories = fs
    .readdirSync(path.join(cwd, 'tests'), { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);

for (const category of categories) {
    if (CATEGORY && category !== CATEGORY) {
        continue;
    }

    const subcategories = fs
        .readdirSync(path.join(cwd, 'tests', category), {withFileTypes: true})
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);

    for (const subcategory of subcategories) {
        if (SUBCATEGORY && subcategory !== SUBCATEGORY) {
            continue;
        }

        const outputFileName = WITH_USER_DEFINED_OPTIONS ? 'output-with-options.json' : 'output.json';
        const testFilePath = path.join(cwd, 'tests', category, subcategory, 'index.ts');
        const expectedOutputPath = path.join(cwd, 'tests', category, subcategory, outputFileName);

        if (!fs.existsSync(testFilePath) || !fs.existsSync(expectedOutputPath)) {
            continue;
        }

        const expectedOutputFile = JSON.parse(fs.readFileSync(expectedOutputPath, 'utf-8'));

        describe(`${category}/${subcategory}`, () => {
            it('should extract the metadata', () => {
                const modules = parseFromFiles([testFilePath], USER_OPTIONS);

                if (DEV) {
                    console.log(JSON.stringify(modules, null, 4));
                }

                if (ASSERT) {
                    expect(modules).to.deep.equal(expectedOutputFile);
                }
            });
        });
    }
}
