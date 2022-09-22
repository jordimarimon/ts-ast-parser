import { ClassDeclaration, DeclarationKind } from '@ts-ast-parser/core';


export class ClassReader {

    private readonly _name: string;

    private readonly _abstract: boolean;

    constructor(decl: ClassDeclaration) {
        this._name = decl.name;
        this._abstract = !!decl.abstract;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.class;
    }

    getName(): string {
        return this._name;
    }

    isAbstract(): boolean {
        return this._abstract;
    }

}
