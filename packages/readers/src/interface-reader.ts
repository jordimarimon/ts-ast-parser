import { DeclarationKind, InterfaceDeclaration } from '@ts-ast-parser/core';


export class InterfaceReader {

    private readonly _decl: InterfaceDeclaration;

    constructor(decl: InterfaceDeclaration) {
        this._decl = decl;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.interface;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

}
