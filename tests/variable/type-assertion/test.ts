import { Reader, VariableReader } from '@ts-ast-parser/readers';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'variable';
const subcategory = 'type-assertion';
const {actual, expected} = getFixture(category, subcategory);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have two modules', () => {
        expect(reader.getAll().length).to.equal(1);
    });

    it('should have one public declaration named "code"', () => {
        const decls = reader.getAll()?.flatMap(mod => mod.getDeclarations());
        const decl = decls?.find(d => d.getName() === 'code') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('unknown');
        expect(decl.getDefault()).to.equal(123);
    });

    it('should have one public declaration named "employeeCode"', () => {
        const decls = reader.getAll()?.flatMap(mod => mod.getDeclarations());
        const decl = decls?.find(d => d.getName() === 'employeeCode') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('number');
        expect(decl.getDefault()).to.equal(123);
    });

    it('should have one public declaration named "x"', () => {
        const decls = reader.getAll()?.flatMap(mod => mod.getDeclarations());
        const decl = decls?.find(d => d.getName() === 'x') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('readonly [4, 5]');
        expect(decl.getDefault()).to.equal('[4, 5]');
    });

});
