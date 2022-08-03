import { JSDoc } from './js-doc';


export interface TypeAliasDeclaration {
    kind: 'type-alias';
    name: string;
    typeParameters: string[];
    value: string;
    jsDoc: JSDoc;
}
