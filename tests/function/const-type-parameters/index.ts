export type HasNames = { names: readonly string[] };

export function foo<K extends {[key: string]: number}>(bar: K): K {
    return bar;
}

export function getNamesExactly<const T extends HasNames>(arg: T): T['names'] {
    return arg.names;
}

export const names = getNamesExactly({ names: ['Alice', 'Bob', 'Eve'] });
