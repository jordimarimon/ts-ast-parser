import { FunctionReader, Reader } from '@ts-ast-parser/readers';
import { DeclarationKind } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'function';
const subcategory = 'generator';
const {actual, expected} = getFixture(category, subcategory);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have one module', () => {
        expect(reader.getAll().length).to.equal(1);
    });

    it('should have a function named "foo"', () => {
        const mod = reader.getModuleByIndex(0);
        const decl = mod?.getDeclarationByName('foo') as FunctionReader;
        const signature = decl.getSignatures()[0];

        expect(decl).to.not.equal(null);
        expect(decl.getKind()).to.equal(DeclarationKind.function);
        expect(decl.isGenerator()).to.be.true;
        expect(signature.getParameters().length).to.equal(0);
        expect(signature.getReturnType().getValue()).to.equal('Generator<number, string, unknown>');
    });

});
