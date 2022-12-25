enum Colors {
    Red,
    Blue,
    Yellow,
    Green,
}

type TypeX = {x: number; y?: number};
type TypeY = {z?: boolean};
export type TypeArray = TypeX[];

export const foo: Colors = Colors.Red;
export const blue = Colors.Blue;
export const bar: TypeX = {x: 4, y: 4};
export const bar2: TypeX & TypeY = {x: 3};
export const foo2: TypeX[] = [];
export const foo3: TypeArray = [];
