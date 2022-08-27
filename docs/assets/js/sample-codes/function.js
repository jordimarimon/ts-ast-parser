export const FUNCTION_CODE = `
// Named function
export function add(x: number, y: number): number {
    return x + y;
}

// Anonymous function
export const myAdd = function (x: number, y: number) {
    return x + y;
};

export const greeter = (fn: (a: string) => void) => {
    fn("Hello, World");
}
`;
