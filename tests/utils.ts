import type { AnalyserOptions, Module, ModuleNode } from '@ts-ast-parser/core';
import { parseFromFiles } from '@ts-ast-parser/core';
import { test as base } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

type TestOptions = {
    category: string;
    subcategory?: string;
    analyzerOptions?: Partial<AnalyserOptions>;
};

const basedDir = path.join(process.cwd(), 'tests');

export const test = base.extend<{ update: boolean }>({
    update: !!process.env['UPDATE_SNAPSHOTS'],
});

export async function getTestResult(options: TestOptions): Promise<{ actual: ModuleNode[]; expected: Module[] }> {
    const { category, subcategory, analyzerOptions } = options;
    const expectedOutputFile = readExpectedOutput(category, subcategory);
    const testFiles = fs
        .readdirSync(path.join(basedDir, category, subcategory ?? ''), { withFileTypes: true })
        .filter(d => d.isFile() && path.extname(d.name) === '.ts' && d.name !== 'test.ts')
        .map(f => path.join(basedDir, category, subcategory ?? '', f.name));

    const modules = await parseFromFiles(testFiles, analyzerOptions);

    return {
        actual: modules.result ?? [],
        expected: expectedOutputFile,
    };
}

export function readExpectedOutput(category: string, subcategory = ''): Module[] {
    const expectedOutputPath = path.join(basedDir, category, subcategory, 'output.json');

    if (!fs.existsSync(expectedOutputPath)) {
        return [];
    }

    try {
        return JSON.parse(fs.readFileSync(expectedOutputPath, 'utf-8'));
    } catch (_) {
        return [];
    }
}

export function updateExpectedOutput(content: Module | Module[], category: string, subcategory = ''): void {
    fs.writeFileSync(path.join(basedDir, category, subcategory, 'output.json'), JSON.stringify(content, null, 4));
}
