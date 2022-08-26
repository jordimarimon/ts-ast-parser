export const isNotEmptyArray = <T = unknown[]>(arr: unknown): arr is T => Array.isArray(arr) && arr.length > 0;
