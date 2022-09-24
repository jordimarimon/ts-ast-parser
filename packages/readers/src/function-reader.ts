import { DeclarationKind, FunctionDeclaration } from '@ts-ast-parser/core';


export class FunctionReader {

    private readonly _decl: FunctionDeclaration;

    constructor(decl: FunctionDeclaration) {
        this._decl = decl;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.function;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

}
