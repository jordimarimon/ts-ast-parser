import { DeclarationKind, FunctionDeclaration } from '@ts-ast-parser/core';


export class FunctionReader {

    private readonly _name: string;

    constructor(decl: FunctionDeclaration) {
        this._name = decl.name;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.function;
    }

    getName(): string {
        return this._name;
    }

}
