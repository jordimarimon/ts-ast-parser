import { parseFromProject } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';


const category = 'from-project';
const subcategory = 'monorepo';
const pkgsDir = path.join(process.cwd(), 'tests', category, subcategory, 'test-project', 'packages');

const pkgs = fs.readdirSync(pkgsDir);


describe(category, () => {

    for (const pkg of pkgs) {
        it(`should reflect the expected modules of package @test-project/${pkg}`, async () => {
            const expected = JSON.parse(fs.readFileSync(path.join(pkgsDir, pkg, 'output.json'), 'utf-8'));
            const actual = await parseFromProject({tsConfigFilePath: path.join(pkgsDir, pkg, 'tsconfig.json')});
            const result = actual?.result?.getModules().map(m => m.serialize());

            expect(result).to.deep.equal(expected);
            expect(actual?.result?.getName()).to.equal(`@test-project/${pkg}`);
        });
    }

});
