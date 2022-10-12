import { DeclarationKind, TypeAliasDeclaration } from '@ts-ast-parser/core';
import { TypeParameterReader } from './type-parameter-reader.js';
import { JSDocReader } from './jsdoc-reader.js';


export class TypeAliasReader extends JSDocReader {

    private readonly _decl: TypeAliasDeclaration;

    private readonly _typeParams: TypeParameterReader[];

    constructor(decl: TypeAliasDeclaration) {
        super(decl.jsDoc);

        this._decl = decl;
        this._typeParams = (decl.typeParameters ?? []).map(t => new TypeParameterReader(t));
    }

    getKind(): DeclarationKind {
        return DeclarationKind.typeAlias;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

    getLine(): number {
        return this._decl.line;
    }

    getValue(): string {
        return this._decl.value ?? '';
    }

    getTypeParameters(): TypeParameterReader[] {
        return this._typeParams;
    }

}
