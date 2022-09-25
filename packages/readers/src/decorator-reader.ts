import { Decorator } from '@ts-ast-parser/core';


export class DecoratorReader {

    private readonly _decorator: Decorator;

    constructor(decorator: Decorator) {
        this._decorator = decorator;
    }

    getName(): string {
        return this._decorator.name ?? '';
    }

    getArguments(): unknown[] {
        return this._decorator.arguments ?? [];
    }

    hasArguments(): boolean {
        return !!this._decorator.arguments?.length;
    }

    getSourceReference(): string {
        return this._decorator.source?.path ?? '';
    }

}
