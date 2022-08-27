export const INTERFACE_CODE = `
interface Person {
    name: string;
    age: number;
}

export interface Position {
    x?: number;
    y?: number;
}

export interface ReadonlyPerson {
    readonly name: string;
    readonly age: number;
}

export interface StringArray {
    [index: number]: string;
}

export interface NumberOrStringDictionary {
    [index: string]: number | string;
    length: number;
    name: string;
}

export type { Person };
`;
