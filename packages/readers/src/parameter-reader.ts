import { NamedParameterElementReader } from './named-parameter-element-reader.js';
import { DecoratorReader } from './decorator-reader.js';
import { Parameter } from '@ts-ast-parser/core';
import { JSDocReader } from './jsdoc-reader.js';
import { TypeReader } from './type-reader.js';


export class ParameterReader extends JSDocReader {

    private readonly _param: Parameter;

    private readonly _type: TypeReader;

    private readonly _decorators: DecoratorReader[];

    private readonly _namedElements: NamedParameterElementReader[];

    constructor(param: Parameter) {
        super(param.jsDoc);

        this._param = param;
        this._type = new TypeReader(param.type);
        this._decorators = (param.decorators ?? []).map(d => new DecoratorReader(d));
        this._namedElements = (param.elements ?? []).map(e => new NamedParameterElementReader(e));
    }

    getName(): string {
        return this._param.name ?? '';
    }

    getType(): TypeReader {
        return this._type;
    }

    isNamed(): boolean {
        return !!this._param.named;
    }

    isRest(): boolean {
        return !!this._param.rest;
    }

    isOptional(): boolean {
        return !!this._param.optional;
    }

    getNamedElements(): NamedParameterElementReader[] {
        return this._namedElements;
    }

    getDefault(): unknown {
        return this._param.default;
    }

    hasDefaultValue(): boolean {
        return this._param.default !== undefined;
    }

    hasDecorators(): boolean {
        return !!this._decorators.length;
    }

    getDecorators(): DecoratorReader[] {
        return this._decorators;
    }

}
