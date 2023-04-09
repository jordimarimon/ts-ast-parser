// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Foo {

    export type TypeFoo = {
        bar: number;
    };

    export enum EnumFoo {
        Apple,
        Orange,
        Mango,
        Cherry,
    }

    export const varFoo = 5;

    export interface IFoo {
        field: number;
    }

    export class ClassFoo implements IFoo {
        field = 3;
    }

    export function logFoo(): string {
        return 'hello world';
    }

}
