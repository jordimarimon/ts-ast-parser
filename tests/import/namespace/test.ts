import { ImportType } from '@ts-ast-parser/core';
import { Reader } from '@ts-ast-parser/readers';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'import';
const subcategory = 'namespace';
const {actual, expected} = getFixture(category, subcategory, ['foo.ts']);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have two modules', () => {
        expect(reader.getAll().length).to.equal(2);
    });

    it('should have a module that imports symbol "Namespace"', () => {
        expect(reader.getAllModulesWithImport('Namespace').length).to.equal(1);
    });

    it('should only have one import', () => {
        const n = reader.getAllModulesWithImport('Namespace')[0]?.getImports().length;

        expect(n).to.equal(1);
    });

    it('should be a namespace import', () => {
        const importKind = reader.getAllModulesWithImport('Namespace')[0]?.getImports()[0]?.getKind();

        expect(importKind).to.equal(ImportType.namespace);
    });

    it('should have import path "./foo.js"', () => {
        const importPath = reader.getAllModulesWithImport('Namespace')[0]?.getImports()[0]?.getPath();

        expect(importPath).to.equal('./foo.js');
    });

});
