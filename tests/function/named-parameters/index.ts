interface NamedParameters {
    a: number;
    b: number;
    c?: number;
    d?: number;
}

export function foo({ a, b, c = 0, d = 1 }: NamedParameters): number {
    return a + b + c + d;
}
