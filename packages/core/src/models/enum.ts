import { DeclarationKind } from './declaration-kind.js';
import { JSDoc } from './js-doc.js';


export interface EnumDeclaration {
    kind: DeclarationKind.enum;
    name: string;
    line: number;
    members?: EnumMember[];
    jsDoc?: JSDoc;
    namespace?: string;
}

export interface EnumMember {
    name: string;
    value: string | number;
    jsDoc?: JSDoc;
}
