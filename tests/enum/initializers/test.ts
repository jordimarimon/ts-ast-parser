import { EnumReader, Reader } from '@ts-ast-parser/readers';
import { DeclarationKind } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'enum';
const subcategory = 'initializers';
const {actual, expected} = getFixture(category, subcategory);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have one module', () => {
        expect(reader.getAll().length).to.equal(1);
    });

    it('should have an enum declaration', () => {
        expect(reader.getAllModulesWithDeclarationKind(DeclarationKind.enum).length).to.equal(1);
    });

    it('should have an enum declaration named "Fruit"', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.enum)[0];
        const decl = mod?.getDeclarationByName('Fruit');

        expect(decl).to.not.equal(undefined);
    });

    it('should have an four enum members with name and values', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.enum)[0];
        const decl = mod?.getDeclarationByName('Fruit') as EnumReader;
        const members = decl.getMembers();

        expect(members[0].getName()).to.equal('Apple');
        expect(members[0].getValue()).to.equal(0);

        expect(members[1].getName()).to.equal('Orange');
        expect(members[1].getValue()).to.equal(2);

        expect(members[2].getName()).to.equal('Mango');
        expect(members[2].getValue()).to.equal(3);

        expect(members[3].getName()).to.equal('Cherry');
        expect(members[3].getValue()).to.equal(5);

        expect(members[4].getName()).to.equal('Coconut');
        expect(members[4].getValue()).to.equal(6);

        expect(members[5].getName()).to.equal('Kiwi');
        expect(members[5].getValue()).to.equal(7);
    });

});
