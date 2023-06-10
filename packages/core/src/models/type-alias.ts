import type { TypeParameter } from './type-parameter.js';
import type { DeclarationKind } from './declaration-kind.js';
import type { JSDoc } from './js-doc.js';


export interface TypeAliasDeclaration {
    kind: DeclarationKind.TypeAlias;
    name: string;
    line: number;
    value: string;
    typeParameters?: TypeParameter[];
    jsDoc?: JSDoc;
    namespace?: string;
}
