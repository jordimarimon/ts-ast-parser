import { ImportType } from '@ts-ast-parser/core';
import { Reader } from '@ts-ast-parser/readers';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';
import ts from 'typescript';
import path from 'path';


const category = 'import';
const subcategory = 'paths';
const compilerOptions: ts.CompilerOptions = {
    baseUrl: path.join(process.cwd(), 'tests', category, subcategory),
    experimentalDecorators: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    lib: ['es2020'],
    paths: {
        'custom-path/foo': ['./foo.ts'],
    },
};
const {actual, expected} = getFixture(category, subcategory, ['foo.ts'], compilerOptions);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have two modules', () => {
        expect(reader.getAll().length).to.equal(2);
    });

    it('should have a module that imports symbol "Foo"', () => {
        expect(reader.getAllModulesWithImport('Foo').length).to.equal(1);
    });

    it('should only have one import', () => {
        const n = reader.getAllModulesWithImport('Foo')[0]?.getImports().length;

        expect(n).to.equal(1);
    });

    it('should be a named import', () => {
        const importKind = reader.getAllModulesWithImport('Foo')[0]?.getImports()[0]?.getKind();

        expect(importKind).to.equal(ImportType.named);
    });

    it('should have import path "custom-path/foo"', () => {
        const importPath = reader.getAllModulesWithImport('Foo')[0]?.getImports()[0]?.getPath();

        expect(importPath).to.equal('custom-path/foo');
    });

    it('should have the original path set to "tests/import/paths/foo.ts"', () => {
        const originalPath = reader.getAllModulesWithImport('Foo')[0]?.getImports()[0]?.getOriginalPath();

        expect(originalPath).to.equal('tests/import/paths/foo.ts');
    });

    it('should be a bare module specifier', () => {
        const isBareModule = reader.getAllModulesWithImport('Foo')[0]?.getImports()[0]?.isBareModule();

        expect(isBareModule).to.equal(true);
    });

});
