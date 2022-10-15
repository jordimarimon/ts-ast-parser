import { FunctionReader, Reader } from '@ts-ast-parser/readers';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';
import { DeclarationKind } from '@ts-ast-parser/core';


const category = 'function';
const subcategory = 'arrow';
const {actual, expected} = getFixture(category, subcategory);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have one module', () => {
        expect(reader.getAll().length).to.equal(1);
    });

    it('should have a function named "sum"', () => {
        const mod = reader.getModuleByIndex(0);
        const decl = mod?.getDeclarationByName('sum') as FunctionReader;

        expect(decl).to.not.equal(null);
        expect(decl.getKind()).to.equal(DeclarationKind.function);
    });

});
