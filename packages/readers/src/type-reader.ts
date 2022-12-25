import { Type, TypeReference } from '@ts-ast-parser/core';


export class TypeReader {

    private readonly _type: Type;

    constructor(type: Type) {
        this._type = type;
    }

    getValue(): string {
        return this._type.text ?? '';
    }

    getSourceReferences(): TypeReference[] {
        return this._type.sources ?? [];
    }

    getSourceReference(name: string): TypeReference | null {
        return this._type.sources?.find(s => s.text === name) ?? null;
    }

}
