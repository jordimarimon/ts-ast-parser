import { InMemorySystem } from '@ts-ast-parser/core';
import { describe, expect } from 'vitest';
import { test } from '../../utils.js';


const category = 'in-memory';
const subcategory = 'system';

describe(`${category}/${subcategory}`, async () => {

    const system = await InMemorySystem.create();

    test('should allow to write new files', () => {
        system.writeFile('foo.js', 'const x = 3');
        system.writeFile('/Bar.js', 'const y = 4');
        system.writeFile('./Bar.js', 'const y = 5');
        system.writeFile('./dir1/dir2/foo.js', 'const z = 7');

        expect(system.readFile('foo.js')).to.equal('const x = 3');
        expect(system.readFile('/Bar.js')).to.equal('const y = 5');
        expect(system.readFile('./dir1/dir2/foo.js')).to.equal('const z = 7');
    });
});
