export interface Foo {
    add(a: string, b: string): string;
    add(a: number, b: number): string;
    add(a: unknown, b: unknown): string;
}
