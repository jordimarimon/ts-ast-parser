import { NamedParameterElement } from '@ts-ast-parser/core';


export class NamedParameterElementReader {

    private readonly _element: NamedParameterElement;

    constructor(element: NamedParameterElement) {
        this._element = element;
    }

    getName(): string {
        return this._element.name ?? '';
    }

    getValue(): unknown {
        return this._element.value;
    }

}
