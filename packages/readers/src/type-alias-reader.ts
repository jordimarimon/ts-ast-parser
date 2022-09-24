import { DeclarationKind, TypeAliasDeclaration } from '@ts-ast-parser/core';


export class TypeAliasReader {

    private readonly _decl: TypeAliasDeclaration;

    constructor(decl: TypeAliasDeclaration) {
        this._decl = decl;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.typeAlias;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

}
