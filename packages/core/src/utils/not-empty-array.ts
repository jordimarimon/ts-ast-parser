export const isNotEmptyArray = <T extends unknown[]>(arr: unknown): arr is T => Array.isArray(arr) && arr.length > 0;
