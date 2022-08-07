import { JSDoc } from './js-doc.js';


export interface TypeAliasDeclaration {
    kind: 'type-alias';
    name: string;
    typeParameters: string[];
    value: string;
    jsDoc: JSDoc;
}
