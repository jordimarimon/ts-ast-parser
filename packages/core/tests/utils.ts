import { parseFromFiles } from '../src';
import path from 'path';
import fs from 'fs';


const {pathname: cwd} = new URL('../../..', import.meta.url);

export function getFixture(category: string, subcategory = ''): {actual: unknown; expected: unknown} {
    const testFilePath = getTestFilePath(category, subcategory);
    const expectedOutputFile = readExpectedOutput(category, subcategory);
    const modules = parseFromFiles([testFilePath]);

    return {actual: modules, expected: expectedOutputFile};
}

export function logObject(obj: unknown): void {
    console.log(JSON.stringify(obj, null, 4));
}

export function readExpectedOutput(category: string, subcategory = '', fileName = 'output.json'): unknown {
    const expectedOutputPath = path.join(cwd, 'packages', 'core', 'tests', category, subcategory, fileName);

    if (!fs.existsSync(expectedOutputPath)) {
        return;
    }

    return JSON.parse(fs.readFileSync(expectedOutputPath, 'utf-8'));
}

export function getTestFilePath(category: string, subcategory = ''): string {
    return path.join(cwd, 'packages', 'core', 'tests', category, subcategory, 'index.ts');
}
