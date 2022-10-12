import { DeclarationKind, EnumDeclaration } from '@ts-ast-parser/core';
import { EnumMemberReader } from './enum-member-reader.js';
import { JSDocReader } from './jsdoc-reader.js';


export class EnumReader extends JSDocReader {

    private readonly _decl;

    private readonly _members: EnumMemberReader[];

    constructor(decl: EnumDeclaration) {
        super(decl.jsDoc);

        this._decl = decl;
        this._members = decl.members?.map(m => new EnumMemberReader(m)) ?? [];
    }

    getKind(): DeclarationKind {
        return DeclarationKind.enum;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

    getLine(): number {
        return this._decl.line;
    }

    getNamespace(): string {
        return this._decl.namespace ?? '';
    }

    getMembers(): EnumMemberReader[] {
        return this._members;
    }

    getMemberByName(name: string): EnumMemberReader | null {
        return this._members.find(m => m.getName() === name) ?? null;
    }

    getMemberByValue(value: string | number): EnumMemberReader | null {
        return this._members.find(m => m.getValue() === value) ?? null;
    }

}
