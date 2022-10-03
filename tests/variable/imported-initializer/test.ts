import { Reader, VariableReader } from '@ts-ast-parser/readers';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'variable';
const subcategory = 'imported-initializer';
const {actual, expected} = getFixture(category, subcategory, ['foo.ts']);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have two modules', () => {
        expect(reader.getAll().length).to.equal(2);
    });

    it('should have one public declaration named "foo"', () => {
        const decls = reader.getAll()?.flatMap(mod => mod.getDeclarations());
        const decl = decls?.find(d => d.getName() === 'foo') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('number');
        expect(decl.getDefault()).to.equal(4);
    });

    it('should have one public declaration named "bar"', () => {
        const decls = reader.getAll()?.flatMap(mod => mod.getDeclarations());
        const decl = decls?.find(d => d.getName() === 'bar') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('number');
        expect(decl.getDefault()).to.equal(4);
    });

});
