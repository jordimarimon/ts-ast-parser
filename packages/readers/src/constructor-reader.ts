import { ParameterReader } from './parameter-reader.js';
import { Constructor } from '@ts-ast-parser/core';
import { JSDocReader } from './jsdoc-reader.js';


export class ConstructorReader extends JSDocReader {

    private readonly _params: ParameterReader[];

    constructor(ctor: Constructor) {
        super(ctor.jsDoc);

        this._params = (ctor.parameters ?? []).map(p => new ParameterReader(p));
    }

    getParameters(): ParameterReader[] {
        return this._params;
    }

    getParameterByName(name: string): ParameterReader | undefined {
        return this._params.find(p => p.getName() === name);
    }

}
