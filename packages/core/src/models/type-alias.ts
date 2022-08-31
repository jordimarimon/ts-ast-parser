import { DeclarationKind } from './declaration.js';
import { JSDoc } from './js-doc.js';


export interface TypeAliasDeclaration {
    kind: DeclarationKind.typeAlias;
    name: string;
    value: string;
    typeParameters?: string[];
    jsDoc?: JSDoc;
}
