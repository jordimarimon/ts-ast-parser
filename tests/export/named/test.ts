import { ExportType } from '@ts-ast-parser/core';
import { Reader } from '@ts-ast-parser/readers';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'export';
const subcategory = 'named';
const {actual, expected} = getFixture(category, subcategory);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have one module', () => {
        expect(reader.getAll().length).to.equal(1);
    });

    it('should have one export named "foo"', () => {
        expect(reader.getAllModulesWithExport('foo').length).to.equal(1);
    });

    it('should be a named export', () => {
        const exportType = reader.getAllModulesWithExport('foo')[0]?.getExports()[0]?.getType();

        expect(exportType).to.equal(ExportType.named);
    });

});
