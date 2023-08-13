// @ts-expect-error The path will be provided in the compiler options
import { Foo } from 'custom-path/foo';

export class Bar extends Foo {
    bar = 4;
}
