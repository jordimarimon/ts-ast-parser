import { readExpectedOutput, test, updateExpectedOutput } from '../../utils.js';
import { BrowserSystem, NodeSystem, parseFromFiles } from '@ts-ast-parser/core';
import { describe, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';


const category = 'vfs';
const subcategory = 'from-files';
const dir = path.join(process.cwd(), 'tests', category, subcategory);

const path1 = '/file1.ts';
const code1 = fs.readFileSync(path.join(dir, 'index1.ts'), 'utf-8');
const expectedOutput1 = readExpectedOutput(category, subcategory, 'output1.json');

const path2 = '/file2.ts';
const code2 = fs.readFileSync(path.join(dir, 'index2.ts'), 'utf-8');
const expectedOutput2 = readExpectedOutput(category, subcategory, 'output2.json');

describe(category, () => {
    test('should allow updating the contents of a file', async ({ update }) => {
        const system = new NodeSystem({vfs: true, analyserOptions: {include: ['/*.ts']}});
        system.writeFile(path1, code1);

        let actual = (await parseFromFiles([path1], {system})).result;
        let result = actual?.map(m => m.serialize()) ?? [];

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output1.json');
        } else {
            expect(result).to.deep.equal(expectedOutput1);
        }

        system.writeFile(path2, code2);
        actual = (await parseFromFiles([path1, path2], {system})).result;
        result = actual?.map(m => m.serialize()) ?? [];

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output2.json');
        } else {
            expect(result).to.deep.equal(expectedOutput2);
        }
    });

    test('should allow updating the contents of a file', async ({ update }) => {
        const system = await BrowserSystem.create({analyserOptions: {include: ['/*.ts']}});
        system.writeFile(path1, code1);

        let actual = (await parseFromFiles([path1], {system})).result;
        let result = actual?.map(m => m.serialize()) ?? [];

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output1.json');
        } else {
            expect(result).to.deep.equal(expectedOutput1);
        }

        system.writeFile(path2, code2);
        actual = (await parseFromFiles([path1, path2], {system})).result;
        result = actual?.map(m => m.serialize()) ?? [];

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output2.json');
        } else {
            expect(result).to.deep.equal(expectedOutput2);
        }
    });
});
