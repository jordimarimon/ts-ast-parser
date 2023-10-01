import ts from 'typescript';

/**
 * Checks if the version of TypeScript being used is >= 4.8
 *
 * TypeScript introduced breaking changes in v4.8 with how to access decorators and modifiers.
 * See [TypeScript 4.8 release notes]{@link https://devblogs.microsoft.com/typescript/announcing-typescript-4-8}.
 *
 * @returns True if the TypeScript version is >= 4.8
 */
export const isTS4_8 = (): boolean => {
    return typeof ts.canHaveDecorators === 'function' && typeof ts.canHaveModifiers === 'function';
};
