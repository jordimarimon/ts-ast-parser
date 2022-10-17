export class Foo {

    add(a: string, b: string): string;
    add(a: number, b: number): string;
    add(a: unknown, b: unknown): string {
        if (typeof a === 'string' && typeof b === 'string') {
            return a + b;
        }

        if (typeof a === 'number' && typeof b === 'number') {
            return `${a + b}`;
        }

        throw new Error('Unexpected argument types.');
    }

}
