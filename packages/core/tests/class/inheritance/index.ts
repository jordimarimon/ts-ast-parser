export class Class1 {
    foo = 3;

    someMethod(x: number, y: number): number {
        return x + y;
    }
}

export class Class2 extends Class1 {
    bar = 4;
}

export class Class3 extends Class2 {

    override foo = 4;

    // @ts-expect-error We don't wan to put the "override" keyword to make
    // sure we are also able to detect the override without it
    bar = 5;

    // @ts-expect-error We don't wan to put the "override" keyword to make
    // sure we are also able to detect the override without it
    someMethod(x: number): number {
        return x + 2;
    }

}
