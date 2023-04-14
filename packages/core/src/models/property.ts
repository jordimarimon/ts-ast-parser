import type { Decorator } from './decorator.js';
import type { JSDoc } from './js-doc.js';
import type { Type } from './type.js';


export interface PropertyLike {
    name: string;
    line: number;
    type: Type;
    default?: unknown;
    optional?: boolean;
    decorators?: readonly Decorator[];
    jsDoc?: JSDoc;
}
