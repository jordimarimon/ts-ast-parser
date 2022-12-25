import { Reader, VariableReader } from '@ts-ast-parser/readers';
import { DeclarationKind } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'variable';
const subcategory = 'complex-types';
const {actual, expected} = getFixture(category, subcategory);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have one module', () => {
        expect(reader.getAll().length).to.equal(1);
    });

    it('should have one public declaration named "foo"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('foo') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('Colors');
        expect(decl.getDefault()).to.equal('Colors.Red');
    });

    it('should have one public declaration named "blue"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('blue') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('Colors');
        expect(decl.getDefault()).to.equal('Colors.Blue');
    });

    it('should have one public declaration named "bar"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('bar') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('TypeX');
        expect(decl.getDefault()).to.equal('{x: 4, y: 4}');
    });

});
