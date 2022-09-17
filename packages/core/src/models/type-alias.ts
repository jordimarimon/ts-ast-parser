import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { JSDoc } from './js-doc.js';


export interface TypeAliasDeclaration {
    kind: DeclarationKind.typeAlias;
    name: string;
    value: string;
    typeParameters?: TypeParameter[];
    jsDoc?: JSDoc;
}
