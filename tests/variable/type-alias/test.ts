import { Reader, VariableReader } from '@ts-ast-parser/readers';
import { describe, expect, it } from 'vitest';
import { getFixture } from '../../utils.js';


const category = 'variable';
const subcategory = 'type-alias';
const {actual, expected} = getFixture(category, subcategory);
const reader = new Reader(actual);

describe(`${category}/${subcategory}`, () => {

    it('should extract the expected metadata', () => {
        expect(actual).to.deep.equal(expected);
    });

    it('should have two modules', () => {
        expect(reader.getAll().length).to.equal(1);
    });

    it('should have one public declaration named "name"', () => {
        const decls = reader.getAll()?.flatMap(mod => mod.getDeclarations());
        const decl = decls?.find(d => d.getName() === 'name') as VariableReader;

        expect(decl).to.not.equal(null);
        expect(decl.getType().getValue()).to.equal('string');
        expect(decl.getDefault()).to.equal('\'John Doe\'');
    });

});
