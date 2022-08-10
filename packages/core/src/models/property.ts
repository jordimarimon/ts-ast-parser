import { Decorator } from './decorator.js';
import { JSDoc } from './js-doc.js';
import { Type } from './type.js';


export interface PropertyLike {
    name: string;
    type?: Type;
    default?: string;
    optional?: boolean;
    decorators?: Decorator[];
    jsDoc?: JSDoc;
}
