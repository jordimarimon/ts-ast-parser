import { ClassField, DeclarationKind, InterfaceField } from '@ts-ast-parser/core';
import { JSDocReader } from './jsdoc-reader.js';


export class PropertyReader extends JSDocReader {

    private readonly _field: ClassField | InterfaceField;

    constructor(field: ClassField | InterfaceField) {
        super(field.jsDoc);

        this._field = field;
    }

    getKind(): DeclarationKind {
        return DeclarationKind.field;
    }

    getName(): string {
        return this._field.name ?? '';
    }

}
