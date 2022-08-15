// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const myAdd = function(x: number, y: number) {
    return x + y;
};

export const myAdd2 = function myAdd2(x: number, y: number): number {
    return x + y;
};

export default function(x: number, y: number): number {
    return x + y;
}
