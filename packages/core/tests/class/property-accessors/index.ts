export default class Foo {

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static get staticBar() {
        return 'Hello World';
    }

    private _bar = '';

    get bar(): string {
        return this._bar;
    }

    set bar(newBar: string) {
        this._bar = newBar;
    }

}
