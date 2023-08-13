// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore The path will be provided in the compiler options
import { Foo } from 'custom-path/foo';

export class Bar extends Foo {
    bar = 4;
}
