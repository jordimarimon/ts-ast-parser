import { FunctionReader, Reader } from '@ts-ast-parser/readers';
import { DeclarationKind } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'function';
const subcategory = 'basic';
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
        const signature = decl.getSignatures()[0];

        expect(decl).to.not.equal(null);
        expect(decl.getKind()).to.equal(DeclarationKind.function);
        expect(signature.getParameters().length).to.equal(1);
        expect(signature.getParameters()[0].getName()).to.equal('list');
        expect(signature.getParameters()[0].isRest()).to.be.true;
        expect(signature.getParameters()[0].getType().getValue()).to.equal('number[]');
        expect(signature.getReturnType().getValue()).to.equal('number');
        expect(signature.getJSDocTag('param')?.getName()).to.equal('list');
        expect(signature.getJSDocTag('param')?.getDescription()).to.equal('The list of numbers to sum');
        expect(signature.getJSDocTag('returns')?.getDescription()).to.equal('The sum of all the numbers.');
    });

});
