export class Bar {
    bar = 4;

    add(x: number, y: number): number {
        return x + y;
    }
}

export class Foo extends Bar {
    override bar = 3;

    override add(x: number, y: number): number {
        return x + y;
    }

    mult(x: number, y: number): number {
        return x * y;
    }
}
