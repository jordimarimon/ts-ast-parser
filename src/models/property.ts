import { Decorator } from './decorator';
import { JSDoc } from './js-doc';
import { Type } from './type';


export interface PropertyLike {
    name: string;
    description?: string;
    type?: Type;
    default?: string;
    decorators?: Decorator[];
    jsDoc: JSDoc;
}
