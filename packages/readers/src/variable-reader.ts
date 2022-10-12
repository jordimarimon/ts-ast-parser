import { DeclarationKind, VariableDeclaration } from '@ts-ast-parser/core';
import { DecoratorReader } from './decorator-reader.js';
import { JSDocReader } from './jsdoc-reader.js';
import { TypeReader } from './type-reader.js';


export class VariableReader extends JSDocReader {

    private readonly _decl: VariableDeclaration;

    private readonly _type: TypeReader;

    private readonly _decorators: DecoratorReader[];

    constructor(decl: VariableDeclaration) {
        super(decl.jsDoc);

        this._decl = decl;
        this._type = new TypeReader(decl.type);
        this._decorators = (decl.decorators ?? []).map(d => new DecoratorReader(d));
    }

    getKind(): DeclarationKind {
        return DeclarationKind.variable;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

    getLine(): number | undefined {
        return this._decl.line;
    }

    getType(): TypeReader {
        return this._type;
    }

    getDefault(): unknown {
        return this._decl.default;
    }

    getDecorators(): DecoratorReader[] {
        return this._decorators;
    }

    hasDefault(): boolean {
        return this._decl.default !== undefined;
    }

}
