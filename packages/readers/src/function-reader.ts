import { DeclarationKind, FunctionDeclaration } from '@ts-ast-parser/core';
import { TypeParameterReader } from './type-parameter-reader.js';
import { DecoratorReader } from './decorator-reader.js';
import { ParameterReader } from './parameter-reader.js';
import { JSDocReader } from './jsdoc-reader.js';
import { TypeReader } from './type-reader.js';


export class FunctionReader extends JSDocReader {

    private readonly _decl: FunctionDeclaration;

    private readonly _returnType: TypeReader;

    private readonly _decorators: DecoratorReader[];

    private readonly _typeParams: TypeParameterReader[];

    private readonly _params: ParameterReader[];

    constructor(decl: FunctionDeclaration) {
        super(decl.jsDoc);

        this._decl = decl;
        this._typeParams = (decl.typeParameters ?? []).map(t => new TypeParameterReader(t));
        this._decorators = (decl.decorators ?? []).map(d => new DecoratorReader(d));
        this._returnType = new TypeReader(decl.return.type);
        this._params = (decl.parameters ?? []).map(p => new ParameterReader(p));
    }

    getKind(): DeclarationKind {
        // It can be a function or a method
        return this._decl.kind;
    }

    getName(): string {
        return this._decl.name ?? '';
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

    getDecorators(): DecoratorReader[] {
        return this._decorators;
    }

    isAsync(): boolean {
        return !!this._decl.async;
    }

    isGenerator(): boolean {
        return !!this._decl.generator;
    }

}
