interface TypeA {
    foo: string;
}

export type { TypeA };
export type * as foo from './foo.js';
