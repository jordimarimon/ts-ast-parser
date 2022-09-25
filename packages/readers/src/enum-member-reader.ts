import { EnumMember } from '@ts-ast-parser/core';
import { JSDocReader } from './jsdoc-reader.js';


export class EnumMemberReader extends JSDocReader {

    private readonly _member: EnumMember;

    constructor(member: EnumMember) {
        super(member.jsDoc);

        this._member = member;
    }

    getName(): string {
        return this._member.name ?? '';
    }

    getValue(): string | number {
        return this._member.value ?? '';
    }

}
