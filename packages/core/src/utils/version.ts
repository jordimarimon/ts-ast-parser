import { ts4_8 } from '../@types/typescript/index.js';
import ts from 'typescript';


// TS introduced breaking changes in TS 4.8 with how to access decorators
// @see https://devblogs.microsoft.com/typescript/announcing-typescript-4-8
export const isTS4_8 = (): boolean => {
    const _ts = ts as unknown as typeof ts4_8;

    if (_ts.canHaveDecorators === undefined || _ts.canHaveModifiers === undefined) {
        return false;
    }

    return typeof _ts.canHaveDecorators === 'function' && typeof _ts.canHaveModifiers === 'function';
};
