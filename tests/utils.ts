import { parseFromFiles, Options } from '@ts-ast-parser/core';
import ts from 'typescript';
import path from 'path';
import fs from 'fs';


const basedDir = path.join(process.cwd(), 'tests');

export function getFixture(
    category: string,
    subcategory = '',
    importedFiles: string[] = [],
    options: Partial<Options> = {},
    compilerOptions?: ts.CompilerOptions,
): { actual: unknown; expected: unknown } {
    const testFilePath = getTestFilePath(category, subcategory);
    const expectedOutputFile = readExpectedOutput(category, subcategory);
    const importedFilePaths = importedFiles.map(fileName => {
        return path.join(basedDir, category, subcategory, fileName);
    });
    const modules = parseFromFiles([testFilePath, ...importedFilePaths], options, compilerOptions);

    return {actual: modules, expected: expectedOutputFile};
}

export function logObject(obj: unknown): void {
    console.log(JSON.stringify(obj, null, 4));
}

export function readExpectedOutput(category: string, subcategory = '', fileName = 'output.json'): unknown {
    const expectedOutputPath = path.join(basedDir, category, subcategory, fileName);

    if (!fs.existsSync(expectedOutputPath)) {
        return;
    }

    return JSON.parse(fs.readFileSync(expectedOutputPath, 'utf-8'));
}

export function getTestFilePath(category: string, subcategory = ''): string {
    return path.join(basedDir, category, subcategory, 'index.ts');
}