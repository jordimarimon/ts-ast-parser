import { Decorator } from './decorator.js';
import { JSDoc } from './js-doc.js';


export interface EnumDeclaration {
    kind: 'enum';
    name: string;
    members: EnumMember[];
    decorators: Decorator[];
    jsDoc: JSDoc;
}

export interface EnumMember {
    name: string;
    value: string | number;
}
