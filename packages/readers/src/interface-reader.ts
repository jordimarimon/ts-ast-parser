import { DeclarationKind, InterfaceDeclaration } from '@ts-ast-parser/core';


export class InterfaceReader {

    private readonly _name: string;

    constructor(decl: InterfaceDeclaration) {
        this._name = decl.name;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.interface;
    }

    getName(): string {
        return this._name;
    }

}
