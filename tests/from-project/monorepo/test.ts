import { parseFromProject } from '@ts-ast-parser/core';
import { describe, expect } from 'vitest';
import { test } from '../../utils.js';
import * as path from 'node:path';
import * as fs from 'node:fs';


const category = 'from-project';
const subcategory = 'monorepo';
const pkgsDir = path.join(process.cwd(), 'tests', category, subcategory, 'test-project', 'packages');
const pkgs = fs.readdirSync(pkgsDir);

describe(category, () => {
    for (const pkg of pkgs) {
        if (pkg === 'a') {
            continue;
        }

        test(`should reflect the expected modules of package @test-project/${pkg}`, async ({ update }) => {
            const expected = JSON.parse(fs.readFileSync(path.join(pkgsDir, pkg, 'output.json'), 'utf-8'));
            const actual = await parseFromProject({ tsConfigFilePath: path.join(pkgsDir, pkg, 'tsconfig.json') });
            const result = actual.project?.getModules().map(m => m.serialize()) ?? [];

            if (update) {
                fs.writeFileSync(path.join(pkgsDir, pkg, 'output.json'), JSON.stringify(result, null, 4));
                return;
            }

            expect(result).to.deep.equal(expected);
            expect(actual.project?.getName()).to.equal(`@test-project/${pkg}`);
        });
    }
});
