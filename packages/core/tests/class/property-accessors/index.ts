export default class Foo {

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static get staticBar() {
        return 'Hello World';
    }

    private _bar = '';

    private _fooBar = 0;

    get bar(): string {
        return this._bar;
    }

    set bar(newBar: string) {
        this._bar = newBar;
    }

    set fooBar(value: number) {
        this._fooBar = value;
    }

    log(): void {
        console.log(this._fooBar);
    }

}
