import { DeclarationKind } from '@ts-ast-parser/core';


export class MixinReader {

    getKind(): DeclarationKind {
        return DeclarationKind.mixin;
    }

    getName(): string {
        return '';
    }

}
