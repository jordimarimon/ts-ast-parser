import { FunctionReader, Reader } from '@ts-ast-parser/readers';
import { DeclarationKind } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'function';
const subcategory = 'anonymous';
const {actual, expected} = getFixture(category, subcategory);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have one module', () => {
        expect(reader.getAll().length).to.equal(1);
    });

    it('should have a function named "myAdd"', () => {
        const mod = reader.getModuleByIndex(0);
        const decl = mod?.getDeclarationByName('myAdd') as FunctionReader;

        expect(decl).to.not.equal(null);
        expect(decl.getKind()).to.equal(DeclarationKind.function);
    });

    it('should have a function named "myAdd2"', () => {
        const mod = reader.getModuleByIndex(0);
        const decl = mod?.getDeclarationByName('myAdd2') as FunctionReader;

        expect(decl).to.not.equal(null);
        expect(decl.getKind()).to.equal(DeclarationKind.function);
    });

    it('should have an anonymous function ""', () => {
        const mod = reader.getModuleByIndex(0);
        const decl = mod?.getDeclarationByName('') as FunctionReader;

        expect(decl).to.not.equal(null);
        expect(decl.getKind()).to.equal(DeclarationKind.function);
    });

});
