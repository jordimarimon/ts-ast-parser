import { JSDoc } from './js-doc.js';


export interface EnumDeclaration {
    kind: 'enum';
    name: string;
    members?: EnumMember[];
    jsDoc?: JSDoc;
}

export interface EnumMember {
    name: string;
    value: string | number;
}
