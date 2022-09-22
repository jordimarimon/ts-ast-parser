import { DeclarationKind, VariableDeclaration } from '@ts-ast-parser/core';


export class VariableReader {

    private readonly _name: string;

    constructor(decl: VariableDeclaration) {
        this._name = decl.name;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.variable;
    }

    getName(): string {
        return this._name;
    }

}
