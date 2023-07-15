import type { AnalyzerOptions, Module, ModuleNode } from '@ts-ast-parser/core';
import { parseFromFiles } from '@ts-ast-parser/core';
import path from 'path';
import fs from 'fs';


type TestOptions = {
    category: string;
    subcategory?: string;
    importedFiles?: string[];
    analyzerOptions?: Partial<AnalyzerOptions>;
}

const basedDir = path.join(process.cwd(), 'tests');

export function getFixture(options: TestOptions): { actual: ModuleNode[]; expected: Module[] } {
    const {category, subcategory, importedFiles, analyzerOptions} = options;
    const testFilePath = getTestFilePath(category, subcategory);
    const expectedOutputFile = readExpectedOutput(category, subcategory);
    const importedFilePaths = (importedFiles ?? []).map(fileName => {
        return path.join(basedDir, category, subcategory ?? '', fileName);
    });

    const modules = parseFromFiles([testFilePath, ...importedFilePaths], analyzerOptions);

    return {
        actual: modules,
        expected: expectedOutputFile,
    };
}

export function getTestFilePath(category: string, subcategory = ''): string {
    return path.join(basedDir, category, subcategory, 'index.ts');
}

export function readExpectedOutput(category: string, subcategory = '', fileName = 'output.json'): Module[] {
    const expectedOutputPath = path.join(basedDir, category, subcategory, fileName);

    if (!fs.existsSync(expectedOutputPath)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(expectedOutputPath, 'utf-8'));
}

export function logObject(obj: unknown): void {
    console.log(JSON.stringify(obj, null, 4));
}
