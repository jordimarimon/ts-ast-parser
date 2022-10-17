export function add(a: string, b: string): string;
export function add(a: number, b: number): string;
export function add(a: unknown, b: unknown): string {
    if (typeof a === 'string' && typeof b === 'string') {
        return a + b;
    }

    if (typeof a === 'number' && typeof b === 'number') {
        return `${a + b}`;
    }

    throw new Error('Unexpected argument types.');
}
