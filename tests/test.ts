import { describe, it, expect } from 'vitest';
import { generate } from '../src';
import path from 'path';
import fs from 'fs';


// Use the following declarations to debug the tests
const CATEGORY = 'export';
const SUBCATEGORY = 'type';
const DEV = true;
const ASSERT = false;

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

        const testFilePath = path.join(cwd, 'tests', category, subcategory, 'index.ts');
        const expectedOutputPath = path.join(cwd, 'tests', category, subcategory, 'output.json');

        if (!fs.existsSync(testFilePath) || !fs.existsSync(expectedOutputPath)) {
            continue;
        }

        const expectedOutputFile = JSON.parse(fs.readFileSync(expectedOutputPath, 'utf-8'));

        describe(`${category}/${subcategory}`, () => {
            it('should extract the metadata', () => {
                const modules = generate([testFilePath]);

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
