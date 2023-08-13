const defaultValue = 'foo';

function add(x: number, y: number): number {
    return x + y;
}

export class Foo {
    readonly bar: string;

    foo = defaultValue;

    x = 3;

    y = this.x;

    myAdd = add;

    constructor() {
        this.bar = 'bar';
    }
}
