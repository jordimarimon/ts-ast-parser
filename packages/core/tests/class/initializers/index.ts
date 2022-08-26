const defaultValue = 'foo';

export class Foo {

    readonly bar: undefined | string;

    foo = defaultValue;

    constructor() {
        this.bar = 'bar';
    }

}
