import { ClassDeclaration, DeclarationKind } from '@ts-ast-parser/core';


export class ClassReader {

    private readonly _decl: ClassDeclaration;

    constructor(decl: ClassDeclaration) {
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
