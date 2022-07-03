import { describe, it, expect } from 'vitest';
import { generate } from 'ts-ast-parser';
import path from 'path';
import fs from 'fs';


const {pathname: cwd} = new URL('..', import.meta.url);

const categories = fs
    .readdirSync(path.join(cwd, 'tests'), { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);

for (const category of categories) {
    const subcategories = fs
        .readdirSync(path.join(cwd, 'tests', category), {withFileTypes: true})
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);

    for (const subcategory of subcategories) {
        const testFilePath = path.join(cwd, 'tests', category, subcategory, 'index.ts');
        const expectedOutputPath = path.join(cwd, 'tests', category, subcategory, 'output.json');

        if (!fs.existsSync(testFilePath) || !fs.existsSync(expectedOutputPath)) {
            continue;
        }

        const expectedOutputFile = JSON.parse(fs.readFileSync(expectedOutputPath, 'utf-8'));

        describe(`${category}/${subcategory}`, () => {
            it('should generate the correct AST', () => {
                const modules = generate([testFilePath]);

                expect(modules).to.deep.equal(expectedOutputFile);
            });
        });
    }
}
