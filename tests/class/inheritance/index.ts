export class Class1 {
    foo = 3;

    someMethod(x: number, y: number): number {
        return x + y;
    }
}

export class Class2 extends Class1 {
    bar = 4;

    override foo = 5;
}

export class Class3 extends Class2 {

    override bar = 5;

    override someMethod(x: number): number {
        return x + 2;
    }

}
