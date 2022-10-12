import { DeclarationKind } from './declaration-kind.js';
import { TypeParameter } from './type-parameter.js';
import { JSDoc } from './js-doc.js';


export interface TypeAliasDeclaration {
    kind: DeclarationKind.typeAlias;
    name: string;
    line: number;
    value: string;
    typeParameters?: TypeParameter[];
    jsDoc?: JSDoc;
    namespace?: string;
}
