import { ClassDeclaration, DeclarationKind } from '@ts-ast-parser/core';
import { JSDocReader } from './jsdoc-reader.js';


export class ClassReader extends JSDocReader {

    private readonly _decl: ClassDeclaration;

    constructor(decl: ClassDeclaration) {
        super(decl.jsDoc);

        this._decl = decl;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.class;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

    isAbstract(): boolean {
        return !!this._decl.abstract;
    }

}
