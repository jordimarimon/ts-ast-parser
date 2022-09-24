import { DeclarationKind, EnumDeclaration } from '@ts-ast-parser/core';


export class EnumReader {

    private readonly _decl;

    constructor(decl: EnumDeclaration) {
        this._decl = decl;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.enum;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

}
