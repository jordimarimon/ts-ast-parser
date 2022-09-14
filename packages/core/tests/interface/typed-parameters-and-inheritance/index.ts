export interface Foo<T> {
    [index: number]: T;
    field: T;
    method: (a: T) => T;
}

export interface Bar extends Foo<string> {
    childField: number;
}
