/**
 * Example `Foo` class
 */
export class Foo {
    static readonly staticBar = 'Hello World';

    bar?: number;

    #privateField = 4;

    readonly message: string;

    private readonly _x: number = 4;

    private readonly _y: number = 3;

    /**
     * @param {number} x - The x parameter description
     * @param {number} y - The y parameter description
     * @param {string} message - The massage parameter description
     */
    constructor(x: number, y: number, message: string) {
        this._x = x;
        this._y = y;
        this.message = message;
    }

    readonly log = (message: string): void => {
        console.log(message + this.#privateField);
    };

    /**
     * Description of add method
     *
     * @param {number} n - The scale factor
     * @returns The sum
     */
    add(n: number): number {
        return this.#privateMethod() + this._y + n;
    }

    #privateMethod(): number {
        return this._x;
    }
}
