import { FunctionReader, Reader } from '@ts-ast-parser/readers';
import { DeclarationKind } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'function';
const subcategory = 'named-parameters';
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
        expect(signature.getParameters().length).to.equal(1);
        expect(signature.getParameters()[0].isNamed()).to.be.true;
        expect(signature.getParameters()[0].getNamedElements()[0].getName()).to.equal('a');
        expect(signature.getParameters()[0].getNamedElements()[1].getName()).to.equal('b');
        expect(signature.getParameters()[0].getNamedElements()[2].getName()).to.equal('c');
        expect(signature.getParameters()[0].getNamedElements()[2].getValue()).to.equal(0);
        expect(signature.getParameters()[0].getNamedElements()[3].getName()).to.equal('d');
        expect(signature.getParameters()[0].getNamedElements()[3].getValue()).to.equal(1);
    });

});
