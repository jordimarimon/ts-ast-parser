export interface Bar {
    add(x: number, y: number): number;
}

export class Foo implements Bar {
    add(x: number, y: number): number {
        return x + y;
    }
}
