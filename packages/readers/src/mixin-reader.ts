import { DeclarationKind } from '@ts-ast-parser/core';
import { JSDocReader } from './jsdoc-reader.js';


export class MixinReader extends JSDocReader {

    getKind(): DeclarationKind {
        return DeclarationKind.mixin;
    }

    getName(): string {
        return '';
    }

    getNamespace(): string {
        return '';
    }

}
