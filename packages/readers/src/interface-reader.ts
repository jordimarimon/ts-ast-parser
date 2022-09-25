import { DeclarationKind, InterfaceDeclaration } from '@ts-ast-parser/core';
import { JSDocReader } from './jsdoc-reader.js';


export class InterfaceReader extends JSDocReader {

    private readonly _decl: InterfaceDeclaration;

    constructor(decl: InterfaceDeclaration) {
        super(decl.jsDoc);

        this._decl = decl;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.interface;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

}
