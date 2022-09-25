import { Reader, TypeAliasReader } from '@ts-ast-parser/readers';
import { DeclarationKind } from '@ts-ast-parser/core';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'type-alias';
const subcategory = 'type-parameters';
const {actual, expected} = getFixture(category, subcategory);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have one module', () => {
        expect(reader.getAll().length).to.equal(1);
    });

    it('should have a type named "Foo"', () => {
        const decl = reader.getAllModulesWithDeclarationKind(DeclarationKind.typeAlias)[0]?.getDeclarationByName('Foo');

        expect(decl).to.not.equal(null);
    });

    it('should have a value', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.typeAlias)[0];
        const decl = mod?.getDeclarationByName('Foo') as TypeAliasReader;

        expect(decl.getValue()).to.equal('{\n    x: T;\n    y: K;\n}');
    });

    it('should have two type parameters', () => {
        const mod = reader.getAllModulesWithDeclarationKind(DeclarationKind.typeAlias)[0];
        const decl = mod?.getDeclarationByName('Foo') as TypeAliasReader;

        expect(decl.getTypeParameters().length).to.equal(2);
        expect(decl.getTypeParameters()[0].getName()).to.equal('T');
        expect(decl.getTypeParameters()[1].getName()).to.equal('K');
    });

});
