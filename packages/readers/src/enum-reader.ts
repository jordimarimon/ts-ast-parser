import { DeclarationKind, EnumDeclaration } from '@ts-ast-parser/core';


export class EnumReader {

    private readonly _name: string;

    constructor(decl: EnumDeclaration) {
        this._name = decl.name;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.enum;
    }

    getName(): string {
        return this._name;
    }

}
