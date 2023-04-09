import { Decorator } from './decorator.js';
import { JSDoc } from './js-doc.js';
import { Type } from './type.js';


export interface PropertyLike {
    name: string;
    line: number;
    type: Type;
    default?: unknown;
    optional?: boolean;
    decorators?: readonly Decorator[];
    jsDoc?: JSDoc;
}
