/**
 * Example `Foo` class
 */
export class Foo {

    static readonly staticBar = 'Hello World';

    bar?: number;

    readonly message: string | undefined;

    private readonly _x: number = 4;

    private readonly _y: number = 3;

    constructor(x: number, y: number, message: string) {
        this._x = x;
        this._y = y;
        this.message = message;
    }

    readonly log = (message: string): void => {
        console.log(message);
    };

    add(): number {
        return this._x + this._y;
    }

}
