import { ClassMethod, DeclarationKind, FunctionDeclaration } from '@ts-ast-parser/core';
import { DecoratorReader } from './decorator-reader.js';


export class FunctionReader {

    private readonly _decl: FunctionDeclaration | ClassMethod;

    private readonly _decorators: DecoratorReader[];

    constructor(decl: FunctionDeclaration | ClassMethod) {
        this._decl = decl;
        this._decorators = (decl.decorators ?? []).map(d => new DecoratorReader(d));
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
