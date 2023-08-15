import { BrowserSystem, type Module, NodeSystem, parseFromSource } from '@ts-ast-parser/core';
import { readExpectedOutput, test, updateExpectedOutput } from '../../utils.js';
import { describe, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';


const category = 'vfs';
const subcategory = 'from-source';
const dir = path.join(process.cwd(), 'tests', category, subcategory);

const code1 = fs.readFileSync(path.join(dir, 'index1.ts'), 'utf-8');
const expectedOutput1 = readExpectedOutput(category, subcategory, 'output1.json');

const code2 = fs.readFileSync(path.join(dir, 'index2.ts'), 'utf-8');
const expectedOutput2 = readExpectedOutput(category, subcategory, 'output2.json');

describe(category, () => {
    test('should allow updating the contents of a file in Node.js', async ({ update }) => {
        const system = new NodeSystem({vfs: true, analyserOptions: {include: ['/*.ts']}});

        let actual = (await parseFromSource(code1, {system})).result;
        let result = actual?.serialize() ?? ({} as Module);

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output1.json');
        } else {
            expect(result).to.deep.equal(expectedOutput1);
        }

        actual?.update(code2);
        result = actual?.serialize() ?? ({} as Module);

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output2.json');
        } else {
            expect(result).to.deep.equal(expectedOutput2);
        }
    });

    test('should allow updating the contents of a file in a browser', async ({ update }) => {
        const system = await BrowserSystem.create({analyserOptions: {include: ['/*.ts']}});

        let actual = (await parseFromSource(code1, {system})).result;
        let result = actual?.serialize() ?? ({} as Module);

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output1.json');
        } else {
            expect(result).to.deep.equal(expectedOutput1);
        }

        actual?.update(code2);
        result = actual?.serialize() ?? ({} as Module);

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output2.json');
        } else {
            expect(result).to.deep.equal(expectedOutput2);
        }
    });
});
