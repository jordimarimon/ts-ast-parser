import { Reader, VariableReader } from '@ts-ast-parser/readers';
import { DeclarationKind } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'variable';
const subcategory = 'identifier-as-initializer';
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
        expect(decl.getType().getValue()).to.equal('number');
        expect(decl.getDefault()).to.equal(3);
    });

    it('should have one public declaration named "bar"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('bar') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('number');
        expect(decl.getDefault()).to.equal(3);
    });

    it('should have one public declaration named "bar2"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('bar2') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('number');
        expect(decl.getDefault()).to.equal(3);
    });

    it('should have one public declaration named "str"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('str') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('string');
        expect(decl.getDefault()).to.equal('\'Hello\'');
    });

    it('should have one public declaration named "num"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('num') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('number');
        expect(decl.getDefault()).to.equal(4);
    });

    it('should have one public declaration named "bool"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('bool') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('boolean');
        expect(decl.getDefault()).to.equal(false);
    });

    it('should have one public declaration named "obj"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('obj') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('{ x: number; }');
        expect(decl.getDefault()).to.equal('{x: 3}');
    });

    it('should have one public declaration named "arr"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.variable)[0];
        const decl = mod?.getDeclarationByName('arr') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('number[]');
        expect(decl.getDefault()).to.equal('[3]');
    });

});
