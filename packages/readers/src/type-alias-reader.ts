import { DeclarationKind, TypeAliasDeclaration } from '@ts-ast-parser/core';


export class TypeAliasReader {

    private readonly _name: string;

    constructor(decl: TypeAliasDeclaration) {
        this._name = decl.name;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.typeAlias;
    }

    getName(): string {
        return this._name;
    }

}
