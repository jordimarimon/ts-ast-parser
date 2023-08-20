import { readExpectedOutput, test, updateExpectedOutput } from '../../utils.js';
import { InMemorySystem, parseFromSource } from '@ts-ast-parser/core';
import { describe, expect } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs';


const category = 'in-memory';
const subcategory = 'from-source';
const dir = path.join(process.cwd(), 'tests', category, subcategory);

const code1 = fs.readFileSync(path.join(dir, 'index1.ts'), 'utf-8');
const expectedOutput1 = readExpectedOutput(category, subcategory, 'output1.json');

const code2 = fs.readFileSync(path.join(dir, 'index2.ts'), 'utf-8');
const expectedOutput2 = readExpectedOutput(category, subcategory, 'output2.json');

describe(`${category}/${subcategory}`, () => {
    test('should allow updating the contents of a file', async ({ update }) => {
        const system = await InMemorySystem.create();

        let actual = (await parseFromSource(code1, {system})).project;
        let result = actual?.getModules().map(m => m.serialize()) ?? [];

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output1.json');
        } else {
            expect(result).to.deep.equal(expectedOutput1);
        }

        const filePath = actual?.getModules()[0]?.getTSNode().fileName ?? '';

        actual?.update(filePath, code2);
        result = actual?.getModules().map(m => m.serialize()) ?? [];

        if (update) {
            updateExpectedOutput(result, category, subcategory, 'output2.json');
        } else {
            expect(result).to.deep.equal(expectedOutput2);
        }
    }, {timeout: 15_000});
});
