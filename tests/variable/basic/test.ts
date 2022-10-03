import { Reader, VariableReader } from '@ts-ast-parser/readers';
import { DeclarationKind } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'variable';
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

    it('should have one public declaration named "foo"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('foo');

        expect(decl).to.not.equal(null);
    });

    it('should be of type number', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('foo') as VariableReader;

        expect(decl.getType().getValue()).to.equal('number');
    });

    it('should have as value "bar + 3"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('foo') as VariableReader;

        expect(decl.getDefault()).to.equal('bar + 3');
    });

});
