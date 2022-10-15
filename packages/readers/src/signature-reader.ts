import { TypeParameterReader } from './type-parameter-reader.js';
import { FunctionSignature } from '@ts-ast-parser/core';
import { ParameterReader } from './parameter-reader.js';
import { JSDocReader } from './jsdoc-reader.js';
import { TypeReader } from './type-reader.js';


export class SignatureReader extends JSDocReader {

    private readonly _signature: FunctionSignature;

    private readonly _returnType: TypeReader;

    private readonly _typeParams: TypeParameterReader[];

    private readonly _params: ParameterReader[];

    constructor(signature: FunctionSignature) {
        super(signature.jsDoc);

        this._signature = signature;
        this._typeParams = (signature.typeParameters ?? []).map(t => new TypeParameterReader(t));
        this._returnType = new TypeReader(signature.return.type);
        this._params = (signature.parameters ?? []).map(p => new ParameterReader(p));
    }

    getLine(): number {
        return this._signature.line;
    }

    getParameters(): ParameterReader[] {
        return this._params;
    }

    getParameterByName(name: string): ParameterReader | undefined {
        return this._params.find(p => p.getName() === name);
    }

    getReturnType(): TypeReader {
        return this._returnType;
    }

    getTypeParameters(): TypeParameterReader[] {
        return this._typeParams;
    }

}
