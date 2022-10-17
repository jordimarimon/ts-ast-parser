import { ClassMethod, DeclarationKind, FunctionDeclaration } from '@ts-ast-parser/core';
import { DecoratorReader } from './decorator-reader.js';
import { SignatureReader } from './signature-reader.js';
import { JSDocReader } from './jsdoc-reader.js';


export class FunctionReader extends JSDocReader {

    private readonly _decl: FunctionDeclaration | ClassMethod;

    private readonly _decorators: DecoratorReader[];

    private readonly _signatures: SignatureReader[];

    constructor(decl: FunctionDeclaration | ClassMethod) {
        super(decl.jsDoc);

        this._decl = decl;
        this._decorators = (decl.decorators ?? []).map(d => new DecoratorReader(d));
        this._signatures = (decl.signatures ?? []).map(s => new SignatureReader(s));
    }

    getKind(): DeclarationKind {
        // It can be a function or a method
        return this._decl.kind;
    }

    getName(): string {
        return this._decl.name ?? '';
    }

    getNamespace(): string {
        return this._decl.namespace ?? '';
    }

    getDecorators(): DecoratorReader[] {
        return this._decorators;
    }

    getSignatures(): SignatureReader[] {
        return this._signatures;
    }

    getDecoratorWithName(name: string): DecoratorReader | undefined {
        return this._decorators.find(d => d.getName() === name);
    }

    isAsync(): boolean {
        return !!this._decl.async;
    }

    isGenerator(): boolean {
        return !!this._decl.generator;
    }

}
