import { DeclarationKind, VariableDeclaration } from '@ts-ast-parser/core';


export class VariableReader {

    private readonly _decl: VariableDeclaration;

    constructor(decl: VariableDeclaration) {
        this._decl = decl;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.variable;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

}
