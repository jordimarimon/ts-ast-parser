import ts from 'typescript';


// TS introduced breaking changes in TS 4.8 with how to access decorators
// @see https://devblogs.microsoft.com/typescript/announcing-typescript-4-8
export const isTS4_8 = (): boolean => {
    return typeof ts.canHaveDecorators === 'function' && typeof ts.canHaveModifiers === 'function';
};
