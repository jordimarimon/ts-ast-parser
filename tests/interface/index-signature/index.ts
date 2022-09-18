export interface StringArray {
    [index: number]: string;
}

export interface NumberOrStringDictionary {
    [index: string]: number | string;
    length: number;
    name: string;
}
